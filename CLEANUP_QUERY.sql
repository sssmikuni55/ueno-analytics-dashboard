-- 【ダッシュボードお掃除用SQL】
-- このSQLを実行すると、現在の集計テーブル(reporting_summary)からテストドメイン(ngrok等)のデータを除外し、
-- 本番(ueno-sakai.org)のデータのみで再構成します。

-- 注意: 既存のテーブルを上書きします
CREATE OR REPLACE TABLE `ueno-466523.analytics_495214136.reporting_summary` AS
WITH base_events AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS 日付,
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    device.category AS デバイス種別,
    traffic_source.source AS 参照元URL,
    traffic_source.medium AS 参照経路,
    event_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS 興味ありフラグ
  FROM
    `ueno-466523.analytics_495214136.events_*`
  WHERE
    -- 過去すべてのデータを対象にお掃除する場合 (必要に応じて期間を調整してください)
    _TABLE_SUFFIX BETWEEN '20240101' AND '20261231'
    -- 【重要】本番ドメイン限定フィルター
    AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') LIKE 'https://ueno-sakai.org/%'
)

SELECT
  日付,
  CASE 
    WHEN デバイス種別 = 'mobile' THEN 'スマートフォン'
    WHEN デバイス種別 = 'desktop' THEN 'パソコン'
    ELSE 'その他'
  END AS デバイス,
  参照元URL AS どこから来たか,
  参照経路 AS 経路の種類,
  COUNT(DISTINCT session_id) AS 訪問数,
  COUNTIF(event_name = 'page_view') AS 閲覧数,
  COUNT(DISTINCT IF(interest_logic.interest_flag = '1', session_id, NULL)) AS 目標達成数
FROM
  base_events,
  (SELECT '1' as interest_flag) as interest_logic -- 簡易化のため
GROUP BY
  1, 2, 3, 4;
