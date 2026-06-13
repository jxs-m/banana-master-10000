import re

# Read fase1/index.html
with open('/var/www/html/gamecabuloso/fase1/index.html', 'r') as f:
    f1_content = f.read()

# Extract script
script_match = re.search(r'<script>(.*?)</script>', f1_content, re.DOTALL)
script_body = script_match.group(1)

# Apply fixes for SPA (prefixes)
# 1. getElementById('xxx') -> getElementById('f1-xxx')
# Note: we should only prefix specific IDs that belong to F1.
f1_ids = ['wrap', 'gc', 'ctrls', 'clbl', 'hud', 'hprog', 'hlives', 'hspd', 'overlay', 'ob', 'cutsceneOverlay', 'goToPlanetBtn', 'gameover', 'gb', 'goTitle', 'goMsg', 'naoBtn', 'bl', 'bu', 'bd', 'br']
for i in f1_ids:
    script_body = script_body.replace(f"getElementById('{i}')", f"getElementById('f1-{i}')")

# 2. Asset paths
script_body = script_body.replace("'trilha.mp3'", "'fase1/trilha.mp3'")
script_body = script_body.replace("'naveplayer.png'", "'fase1/naveplayer.png'")
script_body = script_body.replace("'naveinimiga.png'", "'fase1/naveinimiga.png'")
script_body = script_body.replace("'planetafundo.png'", "'fase1/planetafundo.png'")
script_body = script_body.replace("'planetSprite.png'", "'fase1/planetSprite.png'")
script_body = script_body.replace("'navefundo.png'", "'fase1/navefundo.png'")

# 3. Next phase transition
# Replace the alert in endGame with window.goToPhase
script_body = script_body.replace("alert('Transição Concluída! Pronto para o próximo minigame.')", "window.goToPhase('fase2')")
# Wait, the alert is in the HTML, not the JS script! 
# Let's check where `window.goToPhase('fase2')` is. It's actually triggered by the `naoBtn` in the HTML. In index.html, the HTML already calls `window.goToPhase('fase2')`.

# 4. Restart game function rename
script_body = script_body.replace("window.restartGame = function", "window.f1RestartGame = function")

# Now read index.html
with open('/var/www/html/gamecabuloso/index.html', 'r') as f:
    index_content = f.read()

# Replace the block from // F1 JS to // F2 JS
# Format:
#         // F1 JS
#         (function(){ ... })();
#         // F2 JS
new_index = re.sub(r'// F1 JS\n\s*\(function\(\)\{\s*.*?\n\s*\}\)\(\);\n', f"// F1 JS\n{script_body}\n", index_content, flags=re.DOTALL)

with open('/var/www/html/gamecabuloso/index.html', 'w') as f:
    f.write(new_index)

print("Patching F1 done")
