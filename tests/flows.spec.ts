import { test, expect, type Page } from '@playwright/test'

async function login(page: Page, profile: string) {
  await page.goto('/login')
  await page.getByRole('button', { name: new RegExp(`^${profile} `) }).click()
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Voltar ao início', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Bem-vindo(a) ao SEALog!' })).toBeVisible()
}

async function navigate(page: Page, label: string) {
  await page.getByRole('navigation', { name: 'Navegação principal' }).filter({ visible: true }).getByRole('link', { name: label, exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-29T15:00:00-03:00'))
})

test('perfis, navegação e proteção das rotas', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Bem-vindo(a) ao SEALog!' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'SEALog — Operador Logístico' })).toBeVisible()
  await expect.poll(() => page.getByRole('img', { name: 'SEALog — Operador Logístico' }).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  await page.screenshot({ path: info.outputPath('login.png'), fullPage: true })
  for (const [profile, heading, route] of [
    ['Atendente', 'Pedidos e entregas', '/pedidos'],
    ['Analista', 'Painel do dia', '/painel'],
    ['Empresas parceiras', 'Painel do dia', '/painel'],
    ['Coordenação', 'Painel do dia', '/painel'],
    ['Financeiro', 'Financeiro', '/financeiro'],
  ]) {
    await login(page, profile)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${route}$`))
    if (profile === 'Atendente') {
      await page.goto('/financeiro')
      await expect(page).toHaveURL(/\/pedidos$/)
    }
    await logout(page)
  }
  await page.getByRole('combobox', { name: 'Selecionar cliente' }).selectOption('c1')
  await expect(page.getByRole('heading', { name: 'Minhas entregas' })).toBeVisible()
  await page.getByRole('button', { name: 'Abrir entrega E-1001', exact: true }).filter({ visible: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await logout(page)
})

test('registro com múltiplas entregas, consulta e persistência', async ({ page }, info) => {
  await login(page, 'Atendente')
  await page.getByRole('link', { name: 'Novo pedido' }).click()
  await page.getByRole('combobox', { name: 'Cliente', exact: true }).selectOption('c1')
  await expect(page.getByRole('button', { name: 'Registrar pedido', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: '+ Adicionar entrega' }).click()
  for (let i = 0; i < 2; i++) {
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: `Entrega ${i + 1}`, exact: true }) })
    await section.getByLabel('Nome do destinatário').fill(`Teste visual ${i + 1}`)
    await section.getByRole('textbox', { name: /^Telefone/ }).fill('81999999999')
    await section.getByLabel('Logradouro').fill('Rua de teste')
    await section.getByLabel('Número', { exact: true }).fill('123')
    await section.getByLabel('Ponto de referência').fill('Próximo à praça')
    await section.getByLabel('Bairro', { exact: true }).fill('Boa Viagem')
    await section.getByLabel('Data desejada').fill('2026-10-29')
  }
  await page.screenshot({ path: info.outputPath('pedido.png'), fullPage: true })
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pedido registrado' })).toBeVisible()
  await expect(page.getByText('Pronta', { exact: true })).toHaveCount(2)
  await page.getByRole('link', { name: 'Ver pedidos' }).click()
  await page.getByRole('textbox', { name: 'Buscar', exact: true }).fill('Teste visual')
  await expect(page.getByText('2 entrega(s) encontrada(s)')).toBeVisible()
  await page.reload()
  await page.getByRole('textbox', { name: 'Buscar', exact: true }).fill('Teste visual')
  await expect(page.getByText('2 entrega(s) encontrada(s)')).toBeVisible()
})

test('completar dados e busca global', async ({ page }) => {
  await login(page, 'Atendente')
  await page.getByRole('button', { name: 'Incompletas (2)' }).click()
  await page.getByRole('button', { name: 'Abrir entrega E-1001', exact: true }).filter({ visible: true }).click()
  await page.getByRole('dialog').getByRole('textbox', { name: /^Telefone/ }).fill('81988887777')
  await page.getByRole('button', { name: 'Salvar e marcar como pronta' }).click()
  await expect(page.getByRole('dialog').getByText('Pronta', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.getByRole('button', { name: 'Busca global' }).click()
  await page.getByRole('dialog').getByRole('textbox', { name: 'Buscar', exact: true }).fill('E-1001')
  await page.getByRole('dialog').getByRole('button', { name: /Ana Souza/ }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'E-1001' })).toBeVisible()
})

test('distribuir entrega e avançar o status', async ({ page }, info) => {
  await login(page, 'Analista')
  await navigate(page, 'Distribuição')
  const ready = page.locator('label').filter({ hasText: 'E-1003' })
  await ready.getByRole('checkbox').check()
  await page.getByRole('button', { name: /^Atribuir a Refactor Express/ }).click()
  const assigned = page.locator('div.card').filter({ hasText: 'E-1003' })
  await assigned.getByRole('button', { name: 'Detalhe', exact: true }).click()
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click()
  await page.getByLabel('Novo status').selectOption('coletada')
  await page.getByRole('button', { name: 'Registrar status' }).click()
  await expect(page.getByRole('dialog').getByText('Coletada', { exact: true }).first()).toBeVisible()
  await page.screenshot({ path: info.outputPath('entrega.png'), fullPage: true })
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.getByRole('button', { name: 'Gerar lista do dia da parceira' }).first().click()
  await expect(page.getByRole('textbox', { name: 'Texto da lista' })).toHaveValue(/E-1003/)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar CSV' }).click()
  expect((await download).suggestedFilename()).toMatch(/\.csv$/)
})

test('decisão de ocorrência e cadastro de parceira', async ({ page }) => {
  await login(page, 'Coordenação')
  await navigate(page, 'Decisões')
  const occurrence = page.locator('section').filter({ hasText: 'E-1024' })
  await occurrence.getByRole('button', { name: 'Reentrega', exact: true }).click()
  await occurrence.getByLabel('Nova data').fill('2026-10-30')
  await occurrence.getByRole('button', { name: 'Confirmar reentrega' }).click()
  await expect(occurrence).toHaveCount(0)
  await navigate(page, 'Parceiras')
  await page.getByRole('button', { name: '+ Nova parceira' }).click()
  await page.getByLabel('Nome', { exact: true }).fill('Parceira de teste')
  await page.getByLabel('Capacidade diária').fill('20')
  await page.getByLabel('Canal preferido').fill('Telefone')
  await page.getByRole('button', { name: 'Zona Sul', exact: true }).click()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Parceira de teste' })).toBeVisible()
})

test('financeiro preserva totais, bloqueio de fechamento e CSV', async ({ page }, info) => {
  await login(page, 'Financeiro')
  await expect(page.locator('tfoot')).toContainText('76,00')
  await page.getByRole('button', { name: 'Repasse por parceira' }).click()
  await expect(page.locator('tfoot')).toContainText('53,20')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar CSV' }).click()
  expect((await download).suggestedFilename()).toBe('financeiro-parceira-2026-10-29.csv')
  await page.screenshot({ path: info.outputPath('financeiro.png'), fullPage: true })
  await page.getByRole('button', { name: 'Fechar o dia' }).click()
  await expect(page.getByRole('heading', { name: 'Não dá para fechar o dia' })).toBeVisible()
  await page.getByRole('button', { name: 'Entendi' }).click()
})

test('telas responsivas sem rolagem horizontal da página', async ({ page }, info) => {
  await login(page, 'Coordenação')
  for (const label of ['Painel', 'Pedidos', 'Distribuição', 'Consulta', 'Decisões', 'Financeiro', 'Parceiras']) {
    await navigate(page, label)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow, `${label} deve caber na tela`).toBe(false)
    await page.screenshot({ path: info.outputPath(`${label}.png`), fullPage: true })
  }
})
