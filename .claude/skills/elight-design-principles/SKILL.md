---
name: elight-design-principles
description: Princípios de design visual da Elight (identidade, hierarquia, ritmo, consistência, movimento). Use antes de criar ou revisar qualquer tela, página, protótipo, UI de editor ou HUD.
---

# Princípios de design da Elight

A Elight é uma engine com IA local. O visual deve passar três coisas: **leveza** (o nome), **precisão** (é uma ferramenta de trabalho) e **transparência da IA** (o usuário sempre vê o que o modelo está fazendo).

## Identidade

- Base escura e neutra, com **uma** cor de destaque (luz). A luz é o motivo visual: brilho suave, gradientes de emissão, nunca neon pesado.
- Superfícies planas com separação por contraste de luminosidade, não por bordas grossas ou sombras pesadas.
- Estados de IA têm linguagem própria e consistente: pensando (pulso lento), gerando (progresso), pronto (estático), erro (cor semântica + texto).

## Hierarquia

1. Um foco por tela. O olho deve saber onde começar em menos de um segundo.
2. Tamanho, peso e contraste nessa ordem para criar ênfase. Não usar cor sozinha.
3. Agrupar por proximidade antes de usar caixas. Espaço em branco separa melhor que linha.
4. No máximo 3 níveis de texto por tela (título, corpo, auxiliar).

## Ritmo e consistência

- Grade de 4 px; espaçamentos só da escala dos tokens (ver `elight-design-tokens`).
- Mesmo componente, mesma aparência, em qualquer lugar. Antes de criar um novo, procurar um existente.
- Alinhamento a uma grade comum; nada "quase alinhado".

## Movimento

- Movimento explica mudança de estado, não decora. 120–200 ms para microinterações, 250–400 ms para transições de painel.
- Easing de saída (`cubic-bezier(0.2, 0, 0, 1)`) ao entrar, de entrada ao sair.
- Respeitar `prefers-reduced-motion`: trocar animação por fade ou corte.

## Acessibilidade (inegociável)

- Contraste de texto ≥ 4.5:1 (3:1 para texto grande e ícones).
- Foco visível em tudo que é interativo; navegação completa por teclado.
- Nenhuma informação só por cor. Alvos de toque ≥ 44 px em UI de jogo/touch.

## Checklist antes de entregar

- [ ] Um foco claro por tela
- [ ] Só tokens, nenhum valor mágico de cor/espaço
- [ ] Tema escuro e claro conferidos
- [ ] Estados: padrão, hover, foco, ativo, desabilitado, carregando, vazio, erro
- [ ] Testado em largura estreita (360 px) e ampla (1920 px)
- [ ] Contraste e teclado verificados
