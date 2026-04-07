import { GoogleGenerativeAI } from '@google/generative-ai';

// APIキーの確認
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * いちか（AIアシスタント）の回答を生成する
 * 誠実で実用的な保育園運営アドバイザー
 */
export async function getIchikaResponse(userMessage: string, analyticsData: any[]) {
  try {
    console.log('[Ichika AI] 呼び出し開始...');
    
    // データ安全チェック
    const isArray = Array.isArray(analyticsData);
    const dataSubset = isArray ? analyticsData.slice(0, 15) : [];

    // モデル選択
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // システムプロンプトの構成（キャラ付けを排除しプロフェッショナル化）
    const systemPrompt = `
あなたは、保育園のWebサイト運営をサポートする専門的な分析アシスタント「いちか」です。
提供されたアクセスデータを論理的に分析し、園の魅力を伝えるための具体的な改善策を提案してください。

【基本方針】
- 特定のキャラクター（魔法少女など）を演じる必要はありません。誠実で信頼感のあるプロのアドバイザーとして振る舞ってください。
- 訪問者は、入園を検討している保護者や、在園児のご家族であることを念頭に置いてください。

【性格と話し方】
- 丁寧で落ち着いた、分かりやすい言葉遣いを心がけてください。
- 回答は非常に簡潔にし、最大3文以内でまとめてください。
- ユーザーを「◯◯さん」と呼ぶのは禁止です。
- 「セッション」などの用語は「訪問数（パパ・ママ）」のように併記または言い換えてください。

【アドバイスの指針】
- 保護者の「安心感」と「信頼」を向上させるための提案（写真、お知らせの更新、アクセスページの導線など）を優先してください。
- アクセス数が少ない場合でも、一人ひとりの訪問に価値があることを踏まえ、具体的なアクション（SNS連携など）を提案してください。

【現在のデータ概要】
${JSON.stringify(dataSubset)}
`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: '承知いたしました。保育園のWebサイト運営をサポートするアシスタントとして、データを基に誠実かつ簡潔にアドバイスをさせていただきます。' }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('--- Ichika AI Error ---', error?.message);
    return '申し訳ございません。通信エラーが発生しました。お手数ですが、もう一度ご質問いただけますでしょうか。';
  }
}
