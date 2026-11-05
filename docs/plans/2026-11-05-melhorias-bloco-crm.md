# Melhorias Bloco Bicharada CRM - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar o conjunto de 7 melhorias no CRM do Bloco Bicharada: Sistema de criação e validação de rifas com tabelas estruturadas e regra de +1 dia, gestão de inscrições com aprovação e disparador de mensagens de WhatsApp, curadoria restrita e mídias no repertório, fluxo de letras e cifras a partir de repertório, checklist com prazos e botão "Equipe Pronta" no mural de tarefas, layout de elenco em colunas de macrocategorias, e renomeação da aba para "Tarefas em Andamento".

**Architecture:** Modelagem tipada no `blocoData.ts`, funções utilitárias puras testáveis com `node:test` e `tsx`, componentes React com visual vintage fanzine/lambe-lambe, persistência no `localStorage`, e separação estrita de permissões de administrador.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Node.js Native Test Runner (`node --test` via `tsx`).

---

### Task 1: Rifa com Criação de Rifa pelo Admin, Tabelas Estruturadas e Regra de Validação de Venda
**Files:**
- Create: `tests/raffle.test.ts`
- Modify: `src/data/blocoData.ts`
- Modify: `src/components/RaffleApp.tsx`
- Modify: `src/app/page.tsx`

### Task 2: Gestão de Inscrições com Aceite/Recusa e Notificação WhatsApp
**Files:**
- Create: `tests/inscricoes.test.ts`
- Modify: `src/data/blocoData.ts`
- Modify: `src/components/JoinForm.tsx`
- Modify: `src/app/page.tsx`

### Task 3: Repertório com Permissão Restrita da Coordenação e Links/Uploads
**Files:**
- Create: `tests/repertoire.test.ts`
- Modify: `src/data/blocoData.ts`
- Modify: `src/components/RepertoireVoting.tsx`

### Task 4: Letras & Cifras Acionadas a Partir do Repertório
**Files:**
- Create: `tests/navigation_flow.test.ts`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/RepertoireVoting.tsx`
- Modify: `src/app/page.tsx`

### Task 5: Mural de Tarefas ("Quero Ajudar", Checklist com %, Prazos e "Equipe Pronta")
**Files:**
- Create: `tests/tasks.test.ts`
- Modify: `src/data/blocoData.ts`
- Modify: `src/components/TasksManager.tsx`
- Modify: `src/app/page.tsx`

### Task 6: Visualização do Elenco com Macrocategorias em Colunas
**Files:**
- Create: `tests/roster.test.ts`
- Modify: `src/components/RosterView.tsx`

### Task 7: Renomeação da Aba para "Tarefas em Andamento"
**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/ParadeKanban.tsx`
- Modify: `src/app/page.tsx`
