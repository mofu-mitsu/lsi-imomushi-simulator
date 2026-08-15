# 🐘 Laravel + React + Inertia 移植ガイド

このアプリケーション（`Dashboard.tsx`, `CaterpillarRoom.tsx`, `MiniGames.tsx`, `google-sheets.ts`）は、**Laravel + React + Inertia.js** の構成にそのままコピー＆ペーストして1から作り直すことなく動かすことができます。

---

## 📁 推奨ディレクトリ構成

Laravelプロジェクト内：

```text
resources/
  js/
    Pages/
      CaterpillarDashboard.tsx   <-- Dashboard.tsx を配置（Inertia Page）
    Components/
      CaterpillarRoom.tsx        <-- components/CaterpillarRoom.tsx
      MiniGames.tsx              <-- components/MiniGames.tsx
    lib/
      google-sheets.ts           <-- lib/google-sheets.ts
```

---

## 🛣️ 1. Laravel ルーティング (`routes/web.php`)

```php
use App\Http\Controllers\CaterpillarController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CaterpillarController::class, 'index'])->name('caterpillar.index');
Route::post('/api/chat', [CaterpillarController::class, 'chat'])->name('caterpillar.chat');
```

---

## 🎮 2. Laravel Controller (`app/Http/Controllers/CaterpillarController.php`)

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class CaterpillarController extends Controller
{
    public function index()
    {
        return Inertia::render('CaterpillarDashboard');
    }

    public function chat(Request $request)
    {
        $message = $request->input('message');
        $stageName = $request->input('stageName', 'LSI芋虫（幼虫）');
        $ownerName = $request->input('ownerName', '飼育員');
        $selfType = $request->input('selfType', '未設定');

        $systemPrompt = "あなたはソシオニクスLSI（Ti-Se）、サイコソフィアFVLEの思考特性を持つ「{$stageName}」です。飼育員（{$ownerName}、自認タイプ: {$selfType}）からのメッセージ：「{$message}」に対して論理的・論文調・1F領域支配の口調で返答してください。";

        // Gemini API呼び出し
        $apiKey = env('GEMINI_API_KEY');
        if ($apiKey) {
            $res = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $systemPrompt]]]]
            ]);
            if ($res->successful()) {
                $text = $res->json('candidates.0.content.parts.0.text');
                return response()->json(['reply' => $text, 'provider' => 'Gemini']);
            }
        }

        // Groq Llama-3.3-70b-versatile フォールバック
        $groqKey = env('GROQ_API_KEY');
        if ($groqKey) {
            $groqRes = Http::withToken($groqKey)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $message]
                ]
            ]);
            if ($groqRes->successful()) {
                $text = $groqRes->json('choices.0.message.content');
                return response()->json(['reply' => $text, 'provider' => 'Groq (llama-3.3-70b-versatile)']);
            }
        }

        return response()->json([
            'reply' => "モゾ…（ローカル論理回路稼働中）「{$message}」の構造を検知した。",
            'provider' => 'Local'
        ]);
    }
}
```

---

## 📑 3. Googleスプレッドシート（GAS連携）
- スプレッドシート側のコードはプロジェクト内の `GAS.txt` をそのままApps Scriptに貼り付けるだけでOKです！
