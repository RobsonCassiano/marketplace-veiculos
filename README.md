# marketplace-veiculos

## 📋 Resumo do Projeto

Plataforma de marketplace de veículos **BuscarAuto** Utilizando os arquivos Bootstrap baixados em aula.
Nome sugerido--
---

## ✅ O que foi feito

### 1. **Estrutura do Projeto**
- Diretórioscom separação clara entre HTML, CSS e JavaScript
- Criação de arquivos específicos: `marketplace.css` e `marketplace.js`
- Estruturação do `index.html` do marketplace-página inicial.

### 2. **Header/Navegação**
- Header sticky com fundo branco e sombra
- Navegação centralizada com 5 links (Inicio, Vender, Comprar, Serviços, Sobre)
- Links com efeito hover e sublinha animada (#ff335f)
- Botão "Entrar" alinhado à direita com ícone de usuário SVG

### 3. **Menu Dropdown de Login**
- Menu hamburger que aparece ao clicar em "Entrar"
- Opções: **Login** (cliente) e **Sou Lojista**
- Cada opção com ícone identificador
- Animação suave (fade + slide)
- Fecha automaticamente ao clicar fora

### 4. **Seção Hero**
- Título "Busque por ✨" com texto animado
- Texto animado com gradiente (vermelho e roxo )
- Troca entre frases: "SUV até R$100 mil usado", "Carros elétricos", "Utlitários"e"picape"

### 5. **Search Bar**
- Barra de busca centralizada
- Ícone ✨ visual
- Botão de busca com hover effect (escurece e aumenta)
- Responsivo em mobile

### 6. **Categorias de Filtro**
- Botões: SUV, Sedan, Elétricos, Picapes, Utilitários
- Hover effect com mudança de cor

### 7. **Carrossel de Veículos**
- "Veículos em destaque" com scroll horizontal
- Cards com imagens reais (Unsplash)
- Hover effect com elevação (transform: translateY)
- Botões de navegação (prev/next) para scroll

### 8. **Seção de Serviços**
- Grid responsivo com 3 cards (Financiamento, Seguro Auto, Cadastre sua Loja)
- Hover effect com elevação

### 9. **Footer**
- Créditos e informações da plataforma

### 10. **Responsividade**
- Design adaptado para mobile (max-width: 900px)
- Header em coluna em mobile
- Busca em coluna em mobile

---

## 🔧 Arquivos Criados/Atualizados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `marketplace/index.html` | ✅ Atualizado | HTML limpo sem estilos inline |
| `assets/css/marketplace.css` | ✅ Criado | Todos os estilos modernos |
| `assets/js/marketplace.js` | ✅ Criado | Scripts (animação, carousel, dropdown) |

---

## 🚀 Próximos Passos

- [ ] Criar páginas: `comprar.html`, `servicos.html`, `sobre.html`
- [ ] Página de veículos com detalhes completos (`veiculo.html`)
- [ ] Painel do cliente com favoritos
- [ ] Painel do lojista com dashboard

---

## 📁 Estrutura de Diretórios

```
marketplace-veiculos/
├── marketplace/
│   └── index.html
├── cliente/
│   ├── login.html
│   ├── cadastro.html
│   ├── favoritos.html
│   └── index.html
├── lojista/
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   └── cadastrar-veiculo.html
├── admin/
│   └── index.html
└── assets/
    ├── css/
    │   ├── style.css
    │   ├── marketplace.css
    │   ├── cliente.css
    │   ├── lojista.css
    │   └── admin.css
    ├── js/
    │   ├── main.js
    │   ├── marketplace.js
    │   └── animation.js
    └── images/
```

---

## 🎨 Paleta de Cores

- **Vermelho principal**: #ff335f
- **Roxo Accent**: #7b4dff
- **Cinza Claro**: #f4f6f8
- **Cinza Escuro**: #2f2f39
- **Branco**: #ffffff
- **Preto**: #1f1f1f

---

## 📱 Tecnologias Utilizadas

- **HTML5** - Semântico e acessível
- **CSS3** - Flexbox, Grid, Animações
- **JavaScript Vanilla** - Interatividade
- **SVG** - Ícones escaláveis
- **Bootstrap** - CSS Framework (referenciado)

---

## 🔍 Notas Importantes

- Todos os scripts estão em `marketplace.js`
- Todos os estilos estão em `marketplace.css`
- Imagens do carrossel usam URLs externas (Unsplash)
- Responsividade testada para desktop e mobile
