---
name: elight-editor-ui
description: Padrões de interface do editor da Elight (layout de painéis, viewport, hierarquia de cena, inspetor, console de IA, atalhos, densidade). Use ao projetar ou implementar qualquer parte do editor.
---

# UI do editor

O editor é ferramenta de uso longo e intenso. Prioridades: **densidade legível, velocidade, previsibilidade**.

## Layout padrão

```
┌──────────────────────────────────────────────────────┐
│ Barra de menu / comandos (Ctrl+K)                    │
├────────┬─────────────────────────────┬───────────────┤
│Hierar- │                             │  Inspetor     │
│quia    │        Viewport             │  (propriedades│
│ de     │                             │   do seleci-  │
│ cena   │                             │   onado)      │
├────────┴─────────────────────────────┴───────────────┤
│ Assets │ Console │ IA (modelos, fila, uso de VRAM)   │
└──────────────────────────────────────────────────────┘
```

- Painéis redimensionáveis, acopláveis e com estado persistido. O viewport recebe todo o espaço que sobrar.
- Largura mínima de painel lateral: 240 px. Colapsar em ícones abaixo de 1100 px de janela.

## Componentes

- **Hierarquia:** árvore com expandir/recolher por teclado (setas), arrastar para reparentar, ícone por tipo, olho (visibilidade) e cadeado, renomear com F2.
- **Inspetor:** seções recolhíveis por componente; rótulo à esquerda, campo à direita; campos numéricos arrastáveis (arrastar no rótulo ajusta valor), Shift = 10×, Alt = 0,1×; botão de reset por propriedade alterada.
- **Viewport:** gizmos (mover/rotacionar/escalar) em W/E/R, grade com fade na distância, indicador de eixos no canto, estatísticas (FPS, draw calls) ocultáveis.
- **Paleta de comandos (Ctrl+K):** toda ação do editor deve ser alcançável por aqui.
- **Toasts:** só para confirmação e erro recuperável; erros de build/IA vão para o console com detalhe completo.

## IA local no editor

O usuário precisa ver o que o modelo faz e o que custa:

- Painel de IA mostra: modelo carregado, quantização, VRAM/RAM em uso, fila de inferências, tokens/s.
- Toda geração tem **cancelar**, **progresso** e **desfazer** (entra na pilha de undo como uma operação).
- Conteúdo gerado por IA é marcado visualmente (selo discreto) até o usuário aceitar.
- Nunca bloquear a UI esperando o modelo; inferência é assíncrona e o editor continua responsivo.
- Estado de modelo ausente: explicar o que falta e oferecer o botão de baixar/selecionar, não só mostrar erro.

## Interação

- Undo/redo em tudo que muda a cena. Seleção também deve ser desfazível.
- Atalhos seguem convenções de editores 3D (W/E/R, F para focar, Delete, Ctrl+D duplicar, Ctrl+Z/Y).
- Drag & drop de assets no viewport e na hierarquia, com pré-visualização do alvo.
- Estados vazios ensinam: dizer o que é a área e dar a ação principal.

## Densidade

- Altura de linha padrão 24 px; modo compacto 20 px; modo confortável 32 px (configurável).
- Tipografia `--fs-sm` (12 px) na maior parte do inspetor; `--fs-md` para conteúdo principal.
- Ícones de 16 px com traço consistente; rótulos de texto sempre que o ícone for ambíguo.

Cores e espaçamentos: ver `elight-design-tokens`.
