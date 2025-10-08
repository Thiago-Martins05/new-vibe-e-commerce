# 🛍️ NewVibe - E-commerce Moderno

[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.4-orange?style=for-the-badge)](https://orm.drizzle.team/)
[![Stripe](https://img.shields.io/badge/Stripe-16.12.0-008CDD?style=for-the-badge&logo=stripe)](https://stripe.com/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [API Routes](#api-routes)
- [Deploy](#deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **NewVibe** é uma plataforma de e-commerce moderna e completa, desenvolvida com as melhores práticas e tecnologias atuais. O projeto oferece uma experiência de compra intuitiva e responsiva, desde a navegação de produtos até o processamento de pagamentos.

### Características Principais

- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Autenticação Segura**: Sistema de login com NextAuth.js
- **Carrinho de Compras**: Gerenciamento completo de carrinho com persistência
- **Processamento de Pagamentos**: Integração com Stripe
- **Gestão de Pedidos**: Sistema completo de pedidos e histórico
- **Busca Avançada**: Funcionalidade de busca de produtos
- **Categorização**: Organização por categorias e marcas

## ✨ Funcionalidades

### 🏠 Página Inicial

- Banner hero responsivo
- Listagem de produtos em destaque
- Seletor de categorias
- Marcas parceiras
- Produtos mais vendidos e novos produtos

### 🔍 Busca e Navegação

- Barra de pesquisa global
- Filtros por categoria
- Navegação por produtos similares
- URLs amigáveis (SEO)

### 👤 Autenticação

- Login com Google OAuth
- Registro de usuário
- Gerenciamento de sessão
- Proteção de rotas

### 🛒 Carrinho de Compras

- Adicionar/remover produtos
- Ajustar quantidades
- Persistência de dados
- Cálculo automático de totais

### 📦 Checkout

- Seleção de endereço de entrega
- Validação de formulários
- Integração com Stripe
- Processamento seguro de pagamentos

### 📋 Gestão de Pedidos

- Histórico completo de pedidos
- Status de entrega
- Detalhes de cada pedido
- Rastreamento

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **React Query** - Gerenciamento de estado do servidor

### Backend & Banco de Dados

- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe
- **NextAuth.js** - Autenticação
- **Stripe** - Processamento de pagamentos

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
│   │   ├── create-checkout-session/
│   │   ├── create-order/
│   │   └── ...
│   ├── app/                     # App Router (Next.js 15)
│   │   ├── api/                 # API Routes
│   │   ├── authentication/      # Páginas de auth
│   │   ├── cart/                # Páginas do carrinho
│   │   ├── category/            # Páginas de categoria
│   │   ├── orders/              # Páginas de pedidos
│   │   ├── product-variant/     # Páginas de produtos
│   │   └── search/              # Páginas de busca
│   ├── components/              # Componentes React
│   │   ├── common/              # Componentes compartilhados
│   │   ├── home/                # Componentes da home
│   │   └── ui/                  # Componentes UI (shadcn/ui)
│   ├── contexts/                # Contextos React
│   ├── db/                      # Configuração do banco
│   ├── helpers/                 # Funções utilitárias
│   ├── hooks/                   # Hooks customizados
│   │   ├── mutations/           # Hooks de mutations
│   │   └── queries/             # Hooks de queries
│   ├── lib/                     # Configurações e utilitários
│   └── providers/               # Providers React
├── drizzle/                     # Migrações do banco
├── public/                      # Arquivos estáticos
└── ...
```

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 13 ou superior)
- **Git**

## 🚀 Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/Thiago-Martins05/new-vibe-e-commerce.git
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

4. **Configure o arquivo `.env.local`**

   ```env
   # Banco de dados
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/newvibe"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="sua-chave-secreta-aqui"

   # Google OAuth
   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

## ⚙️ Configuração

### 1. Banco de Dados

Execute as migrações do banco de dados:

```bash
# Gerar migrações
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados de exemplo
npm run db:seed
```

### 2. Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+
4. Crie credenciais OAuth 2.0
5. Configure as URLs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://seu-dominio.com/api/auth/callback/google` (produção)

### 3. Stripe

1. Crie uma conta no [Stripe](https://stripe.com/)
2. Obtenha as chaves de API (teste e produção)
3. Configure o webhook para `https://seu-dominio.com/api/webhooks/stripe`

## 🏃‍♂️ Uso

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### Produção

```bash
# Build do projeto
npm run build

# Iniciar servidor de produção
npm start
```

### Comandos Úteis

```bash
# Linting
npm run lint

# Studio do Drizzle (interface do banco)
npm run db:studio

# Deploy no Vercel
npm run vercel:deploy
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **categories** - Categorias de produtos
- **products** - Produtos
- **product_variants** - Variações de produtos (cores, tamanhos)
- **shipping_addresses** - Endereços de entrega
- **carts** - Carrinhos de compra
- **cart_items** - Itens do carrinho
- **orders** - Pedidos
- **order_items** - Itens dos pedidos

### Relacionamentos

- Um usuário pode ter múltiplos endereços
- Um produto pode ter múltiplas variações
- Um carrinho pertence a um usuário
- Um pedido contém múltiplos itens

## 🔌 API Routes

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Registro
- `GET /api/auth/logout` - Logout
- `GET /api/auth/check-session` - Verificar sessão

### Carrinho

- `POST /api/cart/add-item` - Adicionar item
- `DELETE /api/cart/remove-item` - Remover item
- `GET /api/cart` - Obter carrinho

### Pedidos

- `POST /api/create-order` - Criar pedido
- `GET /api/orders` - Listar pedidos

### Pagamentos

- `POST /api/create-checkout-session` - Criar sessão Stripe
- `POST /api/webhooks/stripe` - Webhook Stripe

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

```bash
# Deploy manual
npm run vercel:deploy
```

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todo o código
- Siga as convenções do ESLint
- Use componentes shadcn/ui quando possível
- Mantenha componentes pequenos e reutilizáveis
- Use React Hook Form + Zod para formulários
- Implemente Server Actions para operações do servidor

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](https://docs.newvibe.com)
2. Abra uma [issue]((https://github.com/Thiago-Martins05/new-vibe-e-commerce))
3. Entre em contato: thiagoroyal05@icloud.com

---

**Desenvolvido usando Next.js, React e TypeScript**
