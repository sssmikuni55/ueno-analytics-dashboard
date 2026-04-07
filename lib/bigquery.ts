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
export async function getSiteAnalytics(startDate: string, endDate: string) {
  const query = `
    SELECT
      event_date,
      hostname,
      device_category,
      source,
      medium,
      SUM(sessions) as sessions,
      SUM(pageviews) as pageviews,
      SUM(goal_clicks) as goal_clicks,
      AVG(engagement_rate) as engagement_rate
    FROM
      \`${process.env.BIGQUERY_REPORTING_TABLE}\`
    WHERE
      -- 文字列(YYYYMMDD)を日付型(DATE)に変換して比較します
      event_date BETWEEN PARSE_DATE('%Y%m%d', @startDate) AND PARSE_DATE('%Y%m%d', @endDate)
      -- 二重の防御: 本番ドメインのみに絞り込み
      AND hostname = 'ueno-sakai.org'
    GROUP BY
      1, 2, 3, 4, 5
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
    console.error('--- !!! BigQuery Error Detailed !!! ---');
    console.error('Message:', error.message);
    if (error.errors) {
      console.error('Internal Errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('---------------------------------------');
    throw error;
  }
}

/**
 * Google Search Consoleデータを取得します
 */
export async function getGscAnalytics(startDate: string, endDate: string) {
  try {
    // 1. 日別推移（グラフ用）
    const trendQuery = `
      SELECT
        data_date as date,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SAFE_DIVIDE(SUM(sum_top_position), SUM(impressions)) as avg_position
      FROM
        \`ueno-466523.searchconsole.searchdata_site_impression\`
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
        query,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        SAFE_DIVIDE(SUM(sum_top_position), SUM(impressions)) as avg_position
      FROM
        \`ueno-466523.searchconsole.searchdata_site_impression\`
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
