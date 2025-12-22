import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive profanity list for quick filtering
const profanityList = [
  // English profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'motherfucker', 'motherfucking',
  'shit', 'shitty', 'bullshit', 'shits', 'shitting',
  'ass', 'asshole', 'assholes', 'asses',
  'bitch', 'bitches', 'bitching', 'bitchy',
  'damn', 'damned', 'dammit', 'goddamn',
  'bastard', 'bastards',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks', 'cocksucker',
  'cunt', 'cunts',
  'piss', 'pissed', 'pissing',
  'whore', 'whores',
  'slut', 'sluts', 'slutty',
  'retard', 'retarded', 'retards',
  'wanker', 'wankers',
  'twat', 'twats',
  'prick', 'pricks',
  'douche', 'douchebag', 'douches',
  // Hate speech terms
  'nigger', 'nigga', 'niggers',
  'faggot', 'faggots', 'fag', 'fags',
  'dyke', 'dykes',
  'spic', 'spics',
  'chink', 'chinks',
  'kike', 'kikes',
  'wetback', 'wetbacks',
  // Azerbaijani profanity
  'siktir', 'sikdir', 'sikmək', 'sikim', 'sik',
  'göt', 'götün', 'götü',
  'orospu', 'orospunun', 'orosbu',
  'peysər', 'peyser',
  'qancıq', 'qanciğ', 'qanciq',
  'lotu', 'lotunu',
  'fahişə', 'fahise',
  'dəli', 'deli',
  'axmaq', 'axmağ',
  'əclaf', 'eclaf',
  'donuz', 'donuzun',
  'it', 'itə', 'iti',
  'şələ', 'sele',
  'gic', 'gicbəsər',
  'vələd', 'veled',
  // Russian profanity
  'блядь', 'бля', 'блять', 'блядина',
  'сука', 'суки', 'сучка',
  'хуй', 'хуи', 'хуя', 'хуем', 'хуёвый',
  'пизда', 'пизды', 'пиздец', 'пиздёж',
  'ебать', 'ебаный', 'ебаться', 'ебал', 'ёбаный',
  'мудак', 'мудаки', 'мудила',
  'залупа',
  'говно', 'говна', 'говнюк',
  'дерьмо',
  'жопа', 'жопы', 'жопой',
  'идиот', 'идиоты',
  'дебил', 'дебилы', 'дебильный',
  'урод', 'уроды',
  'тварь', 'твари',
  'дрянь',
  'падла', 'падлы',
  'сволочь', 'сволочи',
  'козёл', 'козел', 'козлы',
  'шлюха', 'шлюхи',
  'педик', 'педики', 'пидор', 'пидорас',
  // Transliterated Russian
  'blyad', 'suka', 'hui', 'pizda', 'ebat', 'mudak', 'govno', 'zhopa',
  // Transliterated Azerbaijani
  'siktir', 'got', 'orospu', 'qanciq', 'axmaq',
];

function containsProfanityQuick(text: string): { hasProfanity: boolean; matchedWords: string[] } {
  const normalizedText = text.toLowerCase();
  const matchedWords: string[] = [];
  
  for (const word of profanityList) {
    // Check for word boundaries to avoid false positives
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      matchedWords.push(word);
    }
  }
  
  return {
    hasProfanity: matchedWords.length > 0,
    matchedWords
  };
}

async function moderateWithAI(content: string): Promise<{ isClean: boolean; reason?: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.log('LOVABLE_API_KEY not configured, skipping AI moderation');
    return { isClean: true };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a content moderation assistant. Analyze the provided text for inappropriate content.
            
Check for:
1. Vulgar language, profanity, or obscenities in ANY language (especially English, Azerbaijani, Russian)
2. Hate speech, slurs, or discriminatory language
3. Personal attacks, threats, or harassment
4. Sexual or explicit content
5. Spam or promotional content

Respond with ONLY a JSON object in this exact format:
{"isClean": true} if the content is appropriate
{"isClean": false, "reason": "brief explanation"} if inappropriate

Be strict but fair. Academic criticism and honest reviews are acceptable.
Disguised profanity (like "f*ck", "sh!t", intentional misspellings) should be flagged.`
          },
          {
            role: "user",
            content: `Analyze this content for moderation:\n\n"${content}"`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('AI moderation rate limited, falling back to keyword filter');
        return { isClean: true };
      }
      if (response.status === 402) {
        console.log('AI moderation payment required, falling back to keyword filter');
        return { isClean: true };
      }
      console.error('AI moderation error:', response.status);
      return { isClean: true };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('AI moderation response:', aiResponse);

    // Parse the AI response
    try {
      // Extract JSON from the response (handle cases where AI adds extra text)
      const jsonMatch = aiResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isClean: parsed.isClean === true,
          reason: parsed.reason
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Fallback: check if response indicates clean content
    return { isClean: !aiResponse.toLowerCase().includes('"isclean": false') };
  } catch (error) {
    console.error('AI moderation error:', error);
    return { isClean: true }; // Allow on error to not block legitimate content
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, useAI = true } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Moderating content:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));
    
    // Step 1: Quick keyword filter
    const keywordResult = containsProfanityQuick(content);
    
    if (keywordResult.hasProfanity) {
      console.log('Content blocked by keyword filter:', keywordResult.matchedWords);
      return new Response(
        JSON.stringify({
          isClean: false,
          blocked: true,
          reason: 'inappropriate_language',
          message: 'Content contains inappropriate language. Please revise and try again.',
          detectedLanguages: ['en', 'az', 'ru']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: AI-based moderation for more nuanced detection
    if (useAI) {
      const aiResult = await moderateWithAI(content);
      
      if (!aiResult.isClean) {
        console.log('Content blocked by AI moderation:', aiResult.reason);
        return new Response(
          JSON.stringify({
            isClean: false,
            blocked: true,
            reason: 'ai_moderation',
            message: aiResult.reason || 'Content may contain inappropriate language. Please revise and try again.',
            detectedLanguages: ['en', 'az', 'ru']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Content passed moderation');
    
    return new Response(
      JSON.stringify({
        isClean: true,
        blocked: false,
        message: 'Content is clean'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in moderate-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
