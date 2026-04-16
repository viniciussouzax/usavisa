import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
console.log('AIS Antecipação — actor placeholder. Input received:', JSON.stringify(input).slice(0, 200));
console.log('Implementação pendente.');

await Actor.exit({ statusMessage: 'AIS Antecipação — placeholder, não implementado ainda.' });
