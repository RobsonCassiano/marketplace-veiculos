# marketplace-veiculos

## 📋 Resumo do Projeto

Plataforma de marketplace de veículos **BuscarAuto** Utilizando os arquivos Bootstrap baixados em aula.
Nome sugerido--
---

## ✅ O que foi feito

### 1. **Estrutura do Projeto**
- Diretórios com separação clara entre HTML, CSS e JavaScript
- Criação de arquivos específicos: `marketplace.css`, `marketplace.js`, `main.js` e arquivos css equivalentes. 
- Estruturação do `index.html` do marketplace-página inicial - SPA.

### 2. **Header/Navegação**
- Header sticky com fundo branco e sombra
- Navegação centralizada com 5 links (Inicio, Vender, Comprar, Serviços, Sobre)
- Links com efeito hover de mudança de cor suave, padronizados com o botão "Entrar"
- Botão "Entrar" alinhado à direita com ícone de usuário SVG
- Submenus (Comprar, Vender, Serviços) com ativação por clique, garantindo consistência na interface - hover
- Menu de serviços com link direto para consulta externa da **Tabela FIPE**

### 3. **Menu Dropdown de Login**
- Menu dropdown que aparece ao clicar em "Entrar"
- Opções: **Login** (cliente) e **Sou Lojista**
- Cada opção com ícone identificador
- Animação suave (fade + slide)
- Lógica de fechamento automático ao clicar fora ou ao abrir outro menu simultaneamente

### 4. **Seção Hero**
- Título "Busque por " com texto animado e gradiente
- Troca modelos: "SUV", "Carros elétricos", etc,.

### 5. **Search Bar**
- Barra de busca por modelo, faixa de preço, região e ano de fabricação
- Ícone visual
- Botão de busca com hover
- Responsivo em mobile

### 6. **Categorias de Filtro**
- Buscar por nome com auto completar - in progress
- Selecionar marca
- Faixa de preços
- Região
- Ano de fabricação

### 7. **Resultados encontrados**
- Ordenar o resultado por: Mais Relevantes, menor preço, maior preço e mais novos
- Cards com imagens reais (Unsplash)

### 8. **Seção de cards**
- Foto, nome do veiculo, valor, região, loja ou particular
- Hover effect com elevação

### 9. **Footer**
- Créditos e informações da plataforma - in progress

### 10. **Responsividade**
- Design adaptado para mobile (max-width: 900px)
- Header em coluna em mobile
- Busca em coluna em mobile

### 11. **Acessibilidade e UX**
- Implementação de atributos ARIA (`aria-expanded`, `aria-haspopup`, `aria-controls`) para melhor suporte a leitores de tela
- Gerenciamento de foco e estados ativos via JavaScript
- Suporte à tecla `Escape` para fechar menus dropdown de forma rápida
- Skip link para navegação direta ao conteúdo principal

---

## 🔧 Arquivos Criados/Atualizados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `index.html` | ✅ Atualizado | HTML limpo sem estilos inline |
| `css` | ✅ Criado | Todos os estilos modernos |
| `js`| ✅ Criado | Scripts (animação, dropdown) |

---

## 🚀 Próximos Passos

- [ ] Linkar as funcionalidades
- [ ] Página de veículos com fotos baixadas
- [ ] Painel do cliente com favoritos
- [ ] Painel do lojista com dashboard

---

## 🎨 Paleta de Cores

- **Azul petrólio**: #073b4c
- **CTAs e destaques** #c65f21
- **Preços/oportunidades/status positivos** #1f7a4d
- **Botões Bootstrap (btn-dark, btn-primary, btn-outline-*)** seguem a nova paleta e contraste alto no texto dos botões
- **Fundo/base**branco e neutros claros: #ffffff

---

## 📱 Tecnologias Utilizadas

- **HTML5** - Semântico e acessível
- **CSS3** - Flexbox, Grid, Animações
- **JavaScript Vanilla** - Interatividade
- **SVG** - Ícones escaláveis
- **Bootstrap** - CSS Framework (referenciado)

---

## 🔍 Notas Importantes
- Responsividade testada para desktop e mobile

- ---
https://robsoncassiano.github.io/marketplace-veiculos-main/
