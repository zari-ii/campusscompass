import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive profanity list (common offensive terms)
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
  'crap', 'crappy',
  'idiot', 'idiots', 'idiotic',
  'stupid', 'stupidity',
  'retard', 'retarded', 'retards',
  'moron', 'morons', 'moronic',
  'dumb', 'dumbass',
  'loser', 'losers',
  'jerk', 'jerks',
  'scum', 'scumbag',
  'trash', 'trashy',
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
  'siktir', 'sikdir', 'sikmək', 'sikim',
  'göt', 'götün',
  'orospu', 'orospunun',
  'peysər', 'peysər',
  'qancıq', 'qanciğ',
  'lotu', 'lotunu',
  'fahişə',
  'xanım', 'xanimsan',
  'dəli',
  // Russian profanity
  'блядь', 'бля', 'блять',
  'сука', 'суки',
  'хуй', 'хуи', 'хуя', 'хуем',
  'пизда', 'пизды', 'пиздец',
  'ебать', 'ебаный', 'ебаться', 'ебал',
  'мудак', 'мудаки',
  'залупа',
  'говно', 'говна',
  'дерьмо',
  'жопа', 'жопы',
  'идиот', 'идиоты',
  'дебил', 'дебилы',
  'урод', 'уроды',
  'тварь', 'твари',
  'дрянь',
];

function containsProfanity(text: string): { hasProfanity: boolean; matchedWords: string[] } {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Moderating content:', content.substring(0, 100) + '...');
    
    const result = containsProfanity(content);
    
    console.log('Moderation result:', { hasProfanity: result.hasProfanity, matchCount: result.matchedWords.length });

    return new Response(
      JSON.stringify({
        isClean: !result.hasProfanity,
        blocked: result.hasProfanity,
        message: result.hasProfanity 
          ? 'Content contains inappropriate language' 
          : 'Content is clean'
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
