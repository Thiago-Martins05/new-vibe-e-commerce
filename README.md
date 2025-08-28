# NEWVIBE - E-commerce Platform

<div align="center">

![NEWVIBE Logo](public/logo.svg)

**Estilo que fala por você**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.4-orange?style=for-the-badge)](https://orm.drizzle.team/)

</div>

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Routes](#-api-routes)
- [Banco de Dados](#-banco-de-dados)
- [Autenticação](#-autenticação)
- [Pagamentos](#-pagamentos)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🚀 Sobre o Projeto

NEWVIBE é uma plataforma de e-commerce moderna e completa desenvolvida com Next.js 15, React 19 e TypeScript. O projeto oferece uma experiência de compra intuitiva e responsiva, com funcionalidades avançadas de autenticação, gerenciamento de carrinho, processamento de pagamentos e acompanhamento de pedidos.

### Características Principais

- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Autenticação Completa**: Login com email/senha e Google OAuth
- **Sistema de Carrinho**: Gerenciamento completo de produtos no carrinho
- **Processamento de Pagamentos**: Integração com Stripe
- **Gestão de Pedidos**: Acompanhamento completo do status dos pedidos
- **Busca Avançada**: Sistema de busca de produtos
- **Categorização**: Organização por categorias
- **Variantes de Produtos**: Suporte a diferentes cores e preços

## ✨ Funcionalidades

### 🛍️ Catálogo de Produtos

- Visualização de produtos com variantes (cores, preços)
- Navegação por categorias
- Sistema de busca avançada
- Produtos em destaque e novos lançamentos

### 👤 Autenticação e Usuários

- Cadastro e login com email/senha
- Autenticação social com Google
- Perfil de usuário com avatar
- Gerenciamento de sessões

### 🛒 Carrinho de Compras

- Adicionar/remover produtos
- Ajustar quantidades
- Cálculo automático de valores
- Persistência de dados

### 📍 Endereços de Entrega

- Cadastro de múltiplos endereços
- Seleção de endereço para entrega
- Validação de dados

### 💳 Processamento de Pagamentos

- Integração com Stripe
- Checkout seguro
- Processamento de pagamentos
- Confirmação de pedidos

### 📦 Gestão de Pedidos

- Histórico completo de pedidos
- Status de entrega
- Detalhes dos itens comprados
- Rastreamento de pedidos

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS 4** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Lucide React** - Ícones

### Backend & Banco de Dados

- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM TypeScript-first
- **BetterAuth** - Sistema de autenticação
- **Stripe** - Processamento de pagamentos

### Estado e Gerenciamento

- **TanStack Query (React Query)** - Gerenciamento de estado do servidor
- **React Context** - Gerenciamento de estado global

### Ferramentas de Desenvolvimento

- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Drizzle Kit** - Migrações e seed do banco

## 📁 Estrutura do Projeto

```
newvibe/
├── src/
│   ├── actions/                 # Server Actions
│   │   ├── add-cart-product/
│   │   ├── clear-cart/
│   │   ├── create-checkout-session/
│   │   ├── create-order/
│   │   ├── create-shipping-address/
│   │   ├── get-cart/
│   │   ├── get-orders/
│   │   ├── increase-cart-product/
│   │   ├── remove-cart-product/
│   │   └── search-products/
│   ├── app/                     # App Router (Next.js 15)
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/           # Autenticação
│   │   │   └── test-create-orders/
│   │   ├── authentication/     # Página de login/cadastro
│   │   ├── cart/               # Fluxo do carrinho
│   │   │   ├── indentification/
│   │   │   └── payment/
│   │   ├── category/           # Páginas de categoria
│   │   ├── orders/             # Histórico de pedidos
│   │   ├── product-variant/    # Páginas de produtos
│   │   ├── search/             # Resultados de busca
│   │   └── success/            # Confirmação de pedido
│   ├── components/             # Componentes React
│   │   ├── common/             # Componentes compartilhados
│   │   └── ui/                 # Componentes de UI (shadcn/ui)
│   ├── contexts/               # Contextos React
│   ├── db/                     # Configuração do banco
│   │   ├── index.ts           # Conexão com banco
│   │   ├── schema.ts          # Esquemas Drizzle
│   │   └── seed.ts            # Dados iniciais
│   ├── helpers/                # Funções utilitárias
│   ├── hooks/                  # Hooks customizados
│   │   ├── mutations/         # Mutations React Query
│   │   └── queries/           # Queries React Query
│   ├── lib/                    # Configurações de bibliotecas
│   └── providers/              # Providers React
├── public/                     # Arquivos estáticos
├── drizzle/                    # Migrações do banco
└── docs/                       # Documentação
```

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 14 ou superior)
- **Git**

## 🚀 Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/newvibe.git
   cd newvibe
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure o banco de dados**

   ```bash
   # Execute as migrações
   npm run db:migrate

   # Popule o banco com dados iniciais
   npm run db:seed
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

O projeto estará disponível em `http://localhost:3000`

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/newvibe"

# Autenticação
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Next.js
NEXTAUTH_SECRET="seu-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+
4. Crie credenciais OAuth 2.0
5. Configure as URLs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://seu-dominio.com/api/auth/callback/google` (produção)

### Configuração do Stripe

1. Crie uma conta no [Stripe](https://stripe.com/)
2. Obtenha as chaves de API no dashboard
3. Configure o webhook para receber eventos de pagamento
4. Configure as URLs de sucesso e cancelamento

## 🎯 Uso

### Fluxo de Compra

1. **Navegação**: Explore produtos por categoria ou use a busca
2. **Seleção**: Escolha produtos e variantes (cores)
3. **Carrinho**: Adicione produtos e ajuste quantidades
4. **Identificação**: Faça login ou cadastre-se
5. **Endereço**: Selecione ou cadastre endereço de entrega
6. **Pagamento**: Finalize a compra com Stripe
7. **Confirmação**: Acompanhe o status do pedido

### Funcionalidades do Usuário

- **Perfil**: Visualize informações da conta
- **Pedidos**: Acompanhe histórico e status
- **Endereços**: Gerencie endereços de entrega
- **Carrinho**: Gerencie produtos no carrinho

## 🔌 API Routes

### Autenticação

- `POST /api/auth/signin` - Login
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/signout` - Logout

### Carrinho

- `GET /api/cart` - Obter carrinho
- `POST /api/cart/add` - Adicionar produto
- `PUT /api/cart/update` - Atualizar quantidade
- `DELETE /api/cart/remove` - Remover produto

### Pedidos

- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/[id]` - Detalhes do pedido

### Pagamentos

- `POST /api/checkout/create-session` - Criar sessão Stripe
- `POST /api/webhooks/stripe` - Webhook Stripe

## 🗄️ Banco de Dados

### Esquema Principal

```sql
-- Usuários
user (id, name, email, emailVerified, image, createdAt, updatedAt)

-- Sessões
session (id, expiresAt, token, userId, ...)

-- Contas (OAuth)
account (id, accountId, providerId, userId, ...)

-- Categorias
category (id, name, slug, createdAt)

-- Produtos
product (id, categoryId, name, slug, description, createdAt)

-- Variantes de Produtos
product_variant (id, productId, name, slug, color, priceInCents, imageUrl, createdAt)

-- Endereços de Entrega
shipping_address (id, userId, recipientName, street, number, ...)

-- Carrinho
cart (id, userId, shippingAddressId, createdAt)

-- Itens do Carrinho
cart_item (id, cartId, productVariantId, quantity, createdAt)

-- Pedidos
order (id, userId, shippingAddressId, totalAmountInCents, status, ...)

-- Itens do Pedido
order_item (id, orderId, productVariantId, quantity, priceInCents, createdAt)
```

### Relacionamentos

- **Usuário** → **Endereços** (1:N)
- **Usuário** → **Carrinho** (1:1)
- **Usuário** → **Pedidos** (1:N)
- **Categoria** → **Produtos** (1:N)
- **Produto** → **Variantes** (1:N)
- **Carrinho** → **Itens** (1:N)
- **Pedido** → **Itens** (1:N)

## 🔐 Autenticação

O projeto utiliza **BetterAuth** para gerenciar autenticação com suporte a:

### Métodos de Autenticação

- **Email/Senha**: Cadastro e login tradicional
- **Google OAuth**: Login social com Google

### Funcionalidades

- Verificação de email
- Recuperação de senha
- Sessões persistentes
- Proteção de rotas

### Configuração de Sessão

```typescript
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: drizzleAdapter(db, { provider: "pg", schema }),
});
```

## 💳 Pagamentos

### Integração Stripe

O projeto utiliza **Stripe** para processamento de pagamentos com:

- **Checkout Sessions**: Interface de pagamento otimizada
- **Webhooks**: Processamento assíncrono de eventos
- **Payment Intents**: Controle granular de pagamentos

### Fluxo de Pagamento

1. **Criação da Sessão**: Gera sessão Stripe com produtos
2. **Redirecionamento**: Usuário é direcionado para Stripe
3. **Processamento**: Stripe processa o pagamento
4. **Webhook**: Confirmação via webhook
5. **Criação do Pedido**: Pedido é criado no banco
6. **Limpeza**: Carrinho é limpo e contexto resetado

### Configuração de Webhook

```typescript
// Eventos processados
-"checkout.session.completed" -
  "payment_intent.succeeded" -
  "payment_intent.payment_failed";
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Cobertura de testes
npm run test:coverage
```

### Criar Dados de Teste

```bash
# Criar pedidos de teste
npm run test:orders

# Popular banco com dados de exemplo
npm run db:seed
```

## 📦 Deploy

### Vercel (Recomendado)

1. **Conecte o repositório** ao Vercel
2. **Configure as variáveis de ambiente**
3. **Deploy automático** a cada push

### Outras Plataformas

- **Netlify**: Configuração similar ao Vercel
- **Railway**: Deploy com PostgreSQL incluído
- **Heroku**: Configuração manual necessária

### Variáveis de Produção

```env
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXTAUTH_URL="https://seu-dominio.com"
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- **TypeScript**: Use tipagem forte
- **ESLint**: Siga as regras de linting
- **Prettier**: Mantenha formatação consistente
- **Commits**: Use mensagens descritivas
- **Branches**: Use padrão `feature/`, `fix/`, `docs/`

### Estrutura de Commits

```
feat: adiciona funcionalidade de busca
fix: corrige bug no carrinho
docs: atualiza documentação
style: formata código
refactor: refatora componente
test: adiciona testes
chore: atualiza dependências
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: thiagoroyal05@icloud..com
- **Issues**: [GitHub Issues](https://github.com/thiago-martins05/new-vibe-e-commerce/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/thiago-martins05/new-vibe-e-commerce/wiki)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript
- [BetterAuth](https://better-auth.com/) - Sistema de autenticação
- [Stripe](https://stripe.com/) - Processamento de pagamentos

---

<div align="center">

**Desenvolvido com Propósito e dedicação Por Thiago Martins**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/thiago-martins05)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/Thiago-Martins05)

</div>
