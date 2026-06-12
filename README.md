# Star Wars: Trench Run (Fase 1)

Este é um jogo web no estilo *Flappy Bird* com temática de **Star Wars** desenvolvido como a primeira fase de um trabalho acadêmico/escolar compartilhado. O jogador controla uma nave X-Wing cruzando trincheiras de defesa da Estrela da Morte, com o objetivo de acumular pontos e atingir a velocidade da luz para saltar para a **Fase 2**.

## 🚀 Como Executar o Jogo

Como o jogo utiliza tecnologias puras (HTML5, CSS3, JavaScript Vanilla), você não precisa de nenhum build ou instalação pesada!

1. Basta abrir o arquivo `index.html` em qualquer navegador moderno.
2. Para uma experiência completa de redirecionamento de links e persistência local, recomendamos abrir o projeto a partir de um servidor local (ex: usando a extensão **Live Server** do VS Code, WampServer ou Python `python -m http.server`).

## 🎮 Como Jogar

- **Pular (Propulsão):** Pressione a barra de **Espaço**, clique com o **Botão Esquerdo do Mouse** na tela ou **Toque na Tela** (se estiver usando um celular ou tablet).
- **Objetivo:** Passar por entre as torres de laser da Estrela da Morte sem colidir.
- **Vitória:** Ao atingir a pontuação limite (padrão: 10 pontos), a nave entra no hiperespaço (velocidade da luz) e o redireciona automaticamente para a Fase 2 após 3 segundos.

## ⚙️ Integração com a Fase dos Colegas (Configurações)

Para facilitar a integração entre os trabalhos do seu grupo, adicionamos um **Painel de Controle** dinâmico que pode ser acessado durante o jogo através do ícone de engrenagem (⚙️) no canto superior direito do HUD (placar).

Neste painel, você pode:
1. **URL da Próxima Fase (Fase 2):** Insira o link relativo ou absoluto para onde o jogador deve ser enviado ao ganhar (Ex: `../fase2/index.html` ou `https://meuamigo.github.io/trabalho/fase2`).
2. **Pontos para Vencer:** Ajuste o número de torres necessárias para completar a missão (útil colocar 2 ou 3 para testar a transição rapidamente).
3. **Velocidade da Missão:** Altere a dificuldade do jogo entre Cadete (Fácil), Piloto (Médio) e Jedi (Difícil) para ajustar a velocidade dos canos, gravidade e espaçamento.
4. **Volume dos Efeitos:** Regule a intensidade dos sons gerados.

As configurações são salvas diretamente no navegador (`localStorage`), ou seja, você só precisa configurar uma vez no seu computador e ela lembrará da próxima vez que abrir!

## 🔊 Tecnologia de Som Sintetizado

Para evitar que o jogo falhe ao carregar arquivos de áudio externos grandes ou lentos, todos os efeitos sonoros são gerados e sintetizados em tempo real via **Web Audio API**:
- **Som do motor (Flap):** Rampa de frequência descendente acoplada com um pequeno disparo de ruído branco filtrado.
- **Sons estilo R2-D2 (Ponto):** Três osciladores senoidais de frequências variadas disparados em rápida sucessão.
- **Explosão (Colisão):** Ruído branco com filtro passa-baixas decaindo exponencialmente.
- **Vitória:** Uma sequência programada de notas (brass/triangular) tocando a icônica fanfarra de vitória espacial.
