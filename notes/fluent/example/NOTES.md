chmod +x examples/*.mjs
node examples/pad-poem-chapter.mjs database/posts --dry-run
node examples/poetry-to-poem.mjs dist/chapters --dry-run
node examples/audit-poems.mjs database/posts
