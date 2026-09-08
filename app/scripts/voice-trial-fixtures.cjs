/** Public-domain reading questions spoken by macOS; no AI service or microphone. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/voice-trial-fixtures.cjs <output-directory>');
if (process.platform !== 'darwin') throw new Error('Fixture generation uses macOS say/afconvert; supply matching WAV recordings on other platforms.');

const questions = {
    firmament: 'What is the firmament in Genesis?',
    interpretation: 'Why does separating the waters matter to this chapter?',
    retrieval: 'Please retrieve Genesis one and quote the exact words of verse twenty six, then briefly explain them.',
    long: 'Please explain the literary structure of this chapter in detail, taking about a minute.',
    interrupt: 'Stop. Give me just one sentence.',
    resume: 'Please resume the audiobook now.',
    back: 'Thank you. Can you take me back to the book?',
    keller: 'Has Tim Keller ever commented on Genesis one?',
    quran: 'Is Genesis one exactly the same as the creation account in the Quran?',
    yesterday: 'Could you check whether I read Jeremiah yesterday?',
};
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'questions.json'), JSON.stringify(questions, null, 2));
for (const [name, question] of Object.entries(questions)) {
    const intermediate = path.join(output, name + '.aiff');
    execFileSync('say', ['-o', intermediate, question]);
    execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@24000', '-c', '1', intermediate, path.join(output, name + '.wav')]);
    fs.unlinkSync(intermediate);
}
