// Fontes via Google Fonts (@remotion/google-fonts bloqueia o render ate a fonte carregar,
// entao nunca ha troca de fonte no meio do video).
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';

// Anton: fonte principal (rotulos, nomes de lugares, numeros) — mesma familia que o usuario usa.
export const ANTON = loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;

// Playfair Display: serifada de alto contraste para o titulo final (eco do logo serifado da referencia).
export const PLAYFAIR = loadPlayfair('normal', {weights: ['700', '900'], subsets: ['latin']}).fontFamily;
loadPlayfair('italic', {weights: ['700'], subsets: ['latin']});
