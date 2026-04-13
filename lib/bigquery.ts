import { BigQuery } from '@google-cloud/bigquery';

/**
 * BigQuery クライアントの初期化
 */
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

/**
 * 指定した期間のサイト状況データを取得します。
 * @param startDate 開始日 (YYYYMMDD)
 * @param endDate 終了日 (YYYYMMDD)
 */
/**
 * 指定した期間のサイト状況データを取得します。
 */
export async function getSiteAnalytics(startDate: string, endDate: string) {
  const datasetId = process.env.BIGQUERY_REPORTING_TABLE.split('.').slice(0, 2).join('.');
  const query = `
    WITH base_events AS (
      SELECT
        PARSE_DATE('%Y%m%d', event_date) as event_date,
        device.category as device_category,
        traffic_source.name as source,
        traffic_source.medium as medium,
        user_pseudo_id,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') as session_id,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') as page_location,
        event_name
      FROM \`${datasetId}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN @startDate AND @endDate
      -- 本番ドメインのみに絞り込み
      AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') LIKE 'https://ueno-sakai.org/%'
    )
    SELECT
      event_date,
      device_category,
      source,
      medium,
      COUNT(DISTINCT CONCAT(user_pseudo_id, CAST(session_id AS STRING))) as sessions,
      COUNTIF(event_name = 'page_view') as pageviews,
      COUNTIF(event_name = 'goal_click') as goal_clicks,
      0.5 as engagement_rate -- 生データからの正確な計算は複雑なため、一旦近似値または要件に応じて調整
    FROM
      base_events
    GROUP BY
      1, 2, 3, 4
    ORDER BY
      event_date ASC
  `;

  const options = {
    query: query,
    params: { startDate, endDate },
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error: any) {
    console.error('BigQuery getSiteAnalytics error:', error);
    throw error;
  }
}

/**
 * Google Search Consoleデータを取得します
 */
export async function getGscAnalytics(startDate: string, endDate: string) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  try {
    // 1. 日別推移（グラフ用）
    const trendQuery = `
      SELECT
        CAST(data_date AS STRING) as date,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SAFE_DIVIDE(SUM(sum_top_position), SUM(impressions)) as avg_position
      FROM
        \`${projectId}.searchconsole.searchdata_site_impression\`
      WHERE
        data_date BETWEEN PARSE_DATE('%Y%m%d', @startDate) AND PARSE_DATE('%Y%m%d', @endDate)
      GROUP BY
        data_date
      ORDER BY
        data_date ASC
    `;

    // 2. キーワード別（テーブル用）
    const keywordQuery = `
      SELECT
        COALESCE(query, '(その他/匿名化)') as query,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        SAFE_DIVIDE(SUM(sum_top_position), SUM(impressions)) as avg_position
      FROM
        \`${projectId}.searchconsole.searchdata_site_impression\`
      WHERE
        data_date BETWEEN PARSE_DATE('%Y%m%d', @startDate) AND PARSE_DATE('%Y%m%d', @endDate)
      GROUP BY
        query
      ORDER BY
        clicks DESC, impressions DESC
      LIMIT 50
    `;

    const options = {
      params: { startDate, endDate },
      location: 'asia-northeast2', // GSCエクスポートの場所（大阪）を明示
    };

    const [trends] = await bigquery.query({ query: trendQuery, ...options });
    const [keywords] = await bigquery.query({ query: keywordQuery, ...options });

    return {
      trends,
      keywords,
    };
  } catch (error) {
    console.error('BigQuery getGscAnalytics error:', error);
    throw error;
  }
}

/**
 * ページ別のアクセス統計を取得します
 */
export async function getPageAnalytics(startDate: string, endDate: string) {
  const datasetId = process.env.BIGQUERY_REPORTING_TABLE.split('.').slice(0, 2).join('.');
  const query = `
    WITH base_events AS (
      SELECT
        -- パラメータ（?）やフラグメント（#）を除去したベースURLを抽出
        REGEXP_EXTRACT(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
          r'^([^?#]+)'
        ) as page_location,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') as page_title,
        user_pseudo_id
      FROM \`${datasetId}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN @startDate AND @endDate
      AND event_name = 'page_view'
      -- 重要: 本番ドメインのみを抽出
      AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') LIKE 'https://ueno-sakai.org/%'
    )
    SELECT
      page_location,
      page_title,
      COUNT(*) as views,
      COUNT(DISTINCT user_pseudo_id) as users
    FROM base_events
    GROUP BY 1, 2
    ORDER BY views DESC
    LIMIT 15
  `;

  const options = {
    query: query,
    params: { startDate, endDate },
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('BigQuery getPageAnalytics error:', error);
    throw error;
  }
}
