# サイトアクセス状況レポート：集計設定手順

「GA4」という言葉を使わず、わかりやすい言葉でサイトの状況を把握するための、データ集計（BigQuery）の設定手順です。

## 1. 集計用SQLの実行

Google Cloud コンソールの BigQuery エディタで、以下のSQLを実行してください。
このSQLは、特定の期間（開始日と終了日）を指定してデータを抽出できるように設計されています。

```sql
/**
 * サイトアクセス状況集計クエリ
 * プロジェクト: ueno-466523
 * データセット: analytics_495214136
 * 
 * ポイント:
 * - 「GA4」という言葉を排除し、日本語で直感的な項目名にしています。
 * - お問い合わせフォームと電話のクリックを「サイト目標達成」として集計します。
 */

DECLARE start_date DEFAULT '20240101'; -- 実際にはダッシュボードから指定されます
DECLARE end_date DEFAULT '20241231';   -- 実際にはダッシュボードから指定されます

WITH base_events AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS 日付,
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    device.category AS デバイス種別,
    traffic_source.source AS 参照元URL,
    traffic_source.medium AS 参照経路,
    event_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS url,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS 興味ありフラグ
  FROM
    `ueno-466523.analytics_495214136.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN start_date AND end_date
    -- 本番ドメイン(ueno-sakai.org)のみを対象にフィルターし、テストデータを除外します
    AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') LIKE 'https://ueno-sakai.org/%'
)

SELECT
  日付,
  -- フィルタリングされていることが明示的にわかるよう、ホスト名を列に含めます
  NET.HOST(url) AS hostname,
  CASE 
    WHEN デバイス種別 = 'mobile' THEN 'スマートフォン'
    WHEN デバイス種別 = 'desktop' THEN 'パソコン'
    WHEN デバイス種別 = 'tablet' THEN 'タブレット'
    ELSE 'その他'
  END AS デバイス,
  参照元URL AS どこから来たか,
  参照経路 AS 経路の種類,
  -- 訪問者数 (セッション数)
  COUNT(DISTINCT CONCAT(user_pseudo_id, session_id)) AS 訪問数,
  -- 閲覧されたページ数
  COUNTIF(event_name = 'page_view') AS 閲覧数,
  -- 特定のアクション（目標）の合計
  COUNTIF(event_name IN ('click_contact_form', 'click_phone_number')) AS 目標クリック数,
  -- 興味関心率（サイトに10秒以上滞在した、または2ページ以上見た人の割合）
  SAFE_DIVIDE(
    COUNT(DISTINCT CASE WHEN 興味ありフラグ = '1' THEN CONCAT(user_pseudo_id, session_id) END),
    COUNT(DISTINCT CONCAT(user_pseudo_id, session_id))
  ) AS 興味関心の割合
FROM
  base_events
GROUP BY
  1, 2, 3, 4, 5
ORDER BY
  日付 DESC;
```

## 2. 定期更新の設定（スケジュールされたクエリ）

毎日データを最新に保つために、以下の設定を行ってください。

1. BigQueryコンソールで上記のSQLを貼り付けます。
2. 上部メニューの **[スケジュール]** > **[スケジュールされたクエリを新規作成]** を選択します。
3. **名前**: `daily_site_analytics_summary`
4. **スケジュール頻度**: 毎日 (Daily)
5. **書き込み設定**: 「テーブルへの追加」または「上書き」を選択してください。
    - 推奨: `reporting_summary` という名前の新規テーブルに出力するように設定します。

これで、ダッシュボードのソースとなる「わかりやすいデータ」が毎日自動で準備されます。
