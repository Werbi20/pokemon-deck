 # 🎮 Pokémon TCG Deck Manager

Um gerenciador completo de decks do Pokémon TCG com sistema de estatísticas e win rate.

## ✨ Funcionalidades Implementadas

### 🎴 **Gerenciamento de Decks**
- ✅ **Criar decks** com nome, descrição e formato
- ✅ **Editar decks** existentes
- ✅ **Excluir decks** com confirmação
- ✅ **Visualizar deck** individual com estatísticas
- ✅ **Validação de regras** do Pokémon TCG:
  - Exatamente 60 cartas para Standard/Expanded
  - Máximo 4 cópias de cada carta (exceto energia básica)
  - Energia básica sem limite de cópias

### 🔍 **Sistema de Busca de Cartas**
- ✅ **Integração com Pokémon TCG API** oficial
- ✅ **Galeria de cartas** com busca por nome
- ✅ **Paginação** para carregar mais resultados
- ✅ **Adição/remoção** de cartas com controle de quantidade

### ⚔️ **Sistema de Partidas**
- ✅ **Registrar partidas** (vitória/derrota)
- ✅ **Associar partidas** a decks específicos
- ✅ **Observações** sobre as partidas
- ✅ **Histórico** de partidas por deck

### 📊 **Estatísticas e Win Rate**
- ✅ **Página de estatísticas** com gráficos interativos
- ✅ **Win rate por deck** (gráfico de barras)
- ✅ **Distribuição vitórias vs derrotas** (gráfico de pizza)
- ✅ **Evolução do win rate** ao longo do tempo (gráfico de linha)
- ✅ **Resumo geral** com totais

### 📥📤 **Importar/Exportar Decks**
- ✅ **Exportar para JSON** (formato Pokémon TCG Live)
- ✅ **Exportar para texto** (formato TCG Live)
- ✅ **Importar de JSON** (formato Pokémon TCG Live)
- ✅ **Importar de texto** (formato TCG Live)

### 🎨 **Interface e UX**
- ✅ **Design responsivo** com Tailwind CSS
- ✅ **Tema Pokémon** com cores oficiais
- ✅ **Navegação intuitiva** entre páginas
- ✅ **Feedback visual** para validação de decks
- ✅ **Modais** para importação e exportação
- ✅ **Indicadores visuais** de status dos decks

## 🛠️ **Tecnologias Utilizadas**

- **Frontend**: Next.js 14 + React + TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Backend**: Firebase (Auth + Firestore)
- **Autenticação**: Google OAuth via Firebase Auth
- **API Externa**: Pokémon TCG API (api.pokemontcg.io)

## 📁 **Estrutura do Projeto**

```
src/
├── app/                    # Páginas Next.js
│   ├── api/               # APIs REST
│   │   ├── cards/search/  # Busca de cartas
│   │   ├── decks/         # CRUD de decks
│   │   └── matches/       # CRUD de partidas
│   ├── decks/             # Páginas de decks
│   │   ├── new/           # Criar deck
│   │   └── [id]/          # Visualizar/editar deck
│   ├── matches/           # Página de partidas
│   └── stats/             # Página de estatísticas
├── components/            # Componentes React
│   ├── DeckCard.tsx       # Card de deck
│   ├── CardGallery.tsx    # Galeria de cartas
│   └── Navigation.tsx     # Navegação
├── lib/                   # Utilitários
│   ├── deckUtils.ts       # Funções de deck
│   ├── firebase.ts        # Configuração Firebase
│   ├── firestore.ts       # Operações Firestore
│   ├── apiClient.ts       # Cliente API com autenticação
│   ├── authMiddleware.ts  # Middleware de autenticação
│   └── tcgApi.ts          # Cliente TCG API
├── hooks/                 # Hooks personalizados
│   └── useAuth.ts         # Hook de autenticação
├── contexts/              # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticação
└── types/                 # Definições TypeScript
```

## 🚀 **Como Executar**

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar Firebase**:
   - O Firebase já está configurado com as credenciais fornecidas
   - As configurações estão em `src/lib/firebase.ts`

3. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acessar**: http://localhost:3000

5. **Fazer login**: Use o botão "Entrar com Google" no canto superior direito

## 📋 **Próximas Implementações**

### 🔐 **Autenticação (Fase 1 - MVP)**
- ✅ Integração com Firebase Auth
- ✅ Login/registro com Google
- ✅ Migração de Prisma para Firestore
- ✅ Sistema de usuários
- ✅ Verificação de token nas APIs (backend)
- ✅ Cliente API com autenticação automática

### 🎯 **Funcionalidades Implementadas (Fase 2)**
- ✅ **Coleção pessoal** de cartas físicas
- ✅ **Análises automáticas** de deck (curva de energia, distribuição de tipos)
- ✅ **Compatibilidade de decks** com coleção pessoal
- ✅ **Sistema de sugestões** automáticas de melhorias
- ✅ **Página de coleção** com filtros e estatísticas

### 🎯 **Funcionalidades Implementadas (Fase 3)**
- ✅ **Filtros avançados** de busca de cartas
- ✅ **Compartilhamento** de decks públicos
- ✅ **Metagame tracker** inspirado no Limitless
- ✅ **Sistema de arquétipos** com tier list
- ✅ **Comunidade de decks** com likes e cópias
- ✅ **Análise de metagame** com gráficos interativos

### 🎯 **Funcionalidades Implementadas (Fase 4 - Social)**
- ✅ **Sistema de perfis** de usuário completo
- ✅ **Sistema de seguir/parar de seguir** usuários
- ✅ **Feed social** com atividades da comunidade
- ✅ **Estatísticas do usuário** (decks, seguidores, etc.)
- ✅ **Personalização de perfil** (bio, links sociais, etc.)
- ✅ **Sistema de notificações** em tempo real
- ✅ **Atividades automáticas** (criar deck, tornar público, etc.)

### 🎯 **Funcionalidades Implementadas (Fase 5 - Preços e Ranking)**
- ✅ **Integração com TCGPlayer API** para preços reais
- ✅ **Sistema de preços** de cartas em tempo real
- ✅ **Ranking de coleções** por valor monetário
- ✅ **Rastreamento de preços** ao longo do tempo
- ✅ **Estatísticas de valor** da coleção
- ✅ **Comparação de coleções** entre usuários

### 🎯 **Melhorias Futuras**
- [ ] **Estatísticas globais** (decks mais usados)
- [ ] **Rastreamento de torneios** e resultados
- [ ] **Sistema de rankings** de jogadores
- [ ] **Chat em tempo real** entre usuários

## 🎮 **Como Usar**

1. **Criar um Deck**:
   - Vá para "Novo Deck"
   - Preencha nome, descrição e formato
   - Busque e adicione cartas
   - O sistema valida automaticamente as regras

2. **Registrar Partidas**:
   - Vá para "Partidas"
   - Selecione o deck usado
   - Registre vitória ou derrota
   - Adicione observações (opcional)

3. **Ver Estatísticas**:
   - Vá para "Estatísticas"
   - Visualize gráficos de win rate
   - Acompanhe evolução ao longo do tempo

4. **Importar/Exportar**:
   - Use os botões de importar/exportar
   - Suporte a formatos do Pokémon TCG Live

## 🎯 **Regras do Pokémon TCG Implementadas**

- ✅ **60 cartas exatas** para Standard/Expanded
- ✅ **Máximo 4 cópias** de cada carta
- ✅ **Energia básica sem limite** de cópias
- ✅ **Validação em tempo real** durante criação/edição
- ✅ **Indicadores visuais** para decks inválidos

### 🌐 **Funcionalidades Sociais**

#### **Sistema de Perfis**
- **Perfil personalizado** com bio, localização e preferências
- **Links sociais** (Twitter, YouTube, Twitch, Discord)
- **Estatísticas** (decks, seguidores, win rate, etc.)
- **Conquistas** e badges de reconhecimento

#### **Sistema de Seguir**
- **Seguir/parar de seguir** outros jogadores
- **Lista de seguidores** e seguindo
- **Contadores** em tempo real
- **Notificações** quando alguém te segue

#### **Feed Social**
- **Atividades em tempo real** da comunidade
- **Tipos de atividade**: criar deck, tornar público, jogar partida, seguir usuário
- **Filtros** por tipo de atividade
- **Timeline** personalizada baseada em quem você segue

#### **Sistema de Notificações**
- **Notificações em tempo real** de interações
- **Tipos**: follow, like, copy, achievement
- **Marcar como lida** individual ou em lote
- **Histórico** de notificações

#### **Atividades Automáticas**
- **Criar deck** → Atividade no feed
- **Tornar público** → Atividade no feed
- **Copiar deck** → Atividade no feed
- **Seguir usuário** → Atividade no feed
- **Jogar partida** → Atividade no feed (opcional)

### 💰 **Sistema de Preços e Ranking**

#### **Integração com TCGPlayer**
- **Preços reais** de cartas do mercado
- **Atualização automática** de preços
- **Mapeamento** entre Pokémon TCG API e TCGPlayer
- **Cálculo de valores** em tempo real

#### **Ranking de Coleções**
- **Ranking global** por valor monetário
- **Posição do usuário** no ranking
- **Percentil** de performance
- **Evolução** do valor ao longo do tempo
- **Comparação** entre usuários

#### **Estatísticas de Valor**
- **Valor total** da coleção
- **Valor médio** por carta
- **Cartas mais valiosas** da coleção
- **Distribuição** por raridade e set
- **Histórico** de variação de preços

#### **Funcionalidades de Preços**
- **Atualização manual** de preços
- **Rastreamento** de mudanças de preço
- **Alertas** de variação significativa
- **Exportação** de relatórios de valor

---

**Desenvolvido com ❤️ para a comunidade Pokémon TCG**

---

Repositório GitHub: `Werbi20/pokemon-deck`

## 🔁 Renomear Deck (Unicidade Garantida)

Ao renomear um deck, o backend agora valida que não existe outro deck do mesmo usuário com o mesmo nome (case insensitive). Se houver conflito a API retorna `409 Conflict`:

Request:
```
PUT /api/decks/{id}
{
   "name": "Novo Nome", 
   "description": "...",
   "format": "Standard",
   "cards": [...]
}
```
Responses:
```
200 { message: "Deck atualizado com sucesso" }
409 { error: "Já existe outro deck com esse nome." }
```
Se o campo `name` não for enviado, o nome atual permanece.
