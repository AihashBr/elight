---
name: elight-game-hud
description: Design de HUD e UI dentro do jogo (legibilidade, safe areas, escala, feedback, diálogo de NPC com IA local, estados de carregamento do modelo). Use ao criar telas, menus, HUD ou interfaces de diálogo do jogo.
---

# HUD e UI de jogo

UI de jogo é lida em movimento, a distância e sob pressão. Menos elementos, mais contraste, feedback imediato.

## Legibilidade

- Texto mínimo: 16 px a 1080p (escalar com a resolução). Contorno ou sombra suave sobre cenas variáveis, ou painel translúcido atrás do texto.
- Contraste ≥ 4.5:1 contra o **pior** fundo possível da cena, não o médio.
- Nunca depender só de cor: acrescentar ícone, forma ou texto.
- Opções de acessibilidade: escala de UI, daltonismo, legendas sempre ligáveis, reduzir movimento.

## Layout

- **Safe area:** 5% de margem nas bordas em TV; respeitar notch e barras do sistema em mobile.
- Informação crítica nos cantos e perto do centro apenas quando indispensável (mira, interação).
- Âncoras por canto/borda e escala por DPI; testar em 16:9, 21:9, 4:3 e retrato.
- Mostrar só o que é relevante agora; esconder HUD em exploração calma e revelar sob mudança de estado.

## Feedback

- Toda ação do jogador tem resposta em < 100 ms (som, cor, escala, partícula).
- Mudanças de valor (vida, munição) animam por 150–300 ms e destacam o delta.
- Foco de menu sempre visível; navegação por gamepad, teclado e mouse equivalentes.

## Diálogo de NPC com IA local

- **Latência é parte do design.** O modelo local pode levar centenas de ms a segundos: mostrar indicador de "pensando" no NPC (gesto, reticências animadas) e **streamar** tokens em vez de esperar a resposta inteira.
- Texto aparece em ritmo legível (typewriter configurável, pular com um botão).
- Entrada do jogador: opções sugeridas + campo livre; sempre oferecer saída rápida.
- Falha ou modelo indisponível: o NPC tem fala de reserva ("…") e o jogo continua; nunca travar a cena.
- Limites e segurança: tamanho máximo de resposta, filtro de conteúdo e reset de contexto, tudo configurável.
- Histórico acessível (log de conversa) e indicação de quem fala (nome, retrato, cor do balão).

## Carregamento e estado do modelo

- Carregar modelo em segundo plano com barra/etapas ("carregando modelo… alocando VRAM…"), jogo jogável antes se possível.
- Mostrar requisitos mínimos e aviso se a máquina não aguenta; oferecer modelo menor automaticamente.

Tokens e movimento: ver `elight-design-tokens`. Princípios gerais: `elight-design-principles`.
