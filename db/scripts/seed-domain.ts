/**
 * Seed do domínio: popula organização sends160 + link do master como owner +
 * solicitação Família Silva + 3 solicitantes + share link.
 *
 * Pré-requisitos:
 *  - Schema aplicado (`bun run db:push`)
 *  - Master user já criado (bra920618@gmail.com, role='admin')
 */

import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  assessor,
  organizacao,
  shareLink,
  solicitacao,
  solicitante,
  user,
} from "../schema";

async function seed() {
  console.log("Seeding domain data...");

  const masterEmail = "bra920618@gmail.com";
  const masterRow = await db.query.user.findFirst({
    where: eq(user.email, masterEmail),
  });
  if (!masterRow) {
    console.error(
      `❌ Master user ${masterEmail} não existe. Faça signup primeiro.`,
    );
    process.exit(1);
  }

  // Organização sends160
  const orgUid = "01HX5XKVJVRK4N7E1J6R0E3P9Q";
  const existing = await db.query.organizacao.findFirst({
    where: eq(organizacao.uid, orgUid),
  });
  if (!existing) {
    await db.insert(organizacao).values({
      uid: orgUid,
      id: 1,
      shortId: "sends160",
      nome: "Assessoria Silva & Associados",
      whatsapp: "5511988887777",
      ativa: true,
      plano: "premium",
    });
    console.log("✅ Organização sends160 criada");
  } else {
    console.log("• sends160 já existe — pulando");
  }

  // Master como owner da sends160
  const existingMember = await db.query.assessor.findFirst({
    where: eq(assessor.userId, masterRow.id),
  });
  if (!existingMember) {
    await db.insert(assessor).values({
      id: crypto.randomUUID(),
      userId: masterRow.id,
      organizacaoUid: orgUid,
      role: "owner",
      ativo: true,
    });
    console.log("✅ Master vinculado à sends160 como owner");
  } else {
    console.log("• Master já tem vínculo — pulando");
  }

  // Solicitação Família Silva
  const solicitacaoUid = "01HX5FAMSILVA0000000000000";
  const existingSol = await db.query.solicitacao.findFirst({
    where: eq(solicitacao.uid, solicitacaoUid),
  });
  if (!existingSol) {
    await db.insert(solicitacao).values({
      uid: solicitacaoUid,
      id: 2050,
      organizacaoUid: orgUid,
      nome: "Família Silva",
      nota: "Tenho uma solução...",
      etapa: "Triagem",
      status: "Todo",
      url: "",
      createdBy: masterRow.id,
    });
    console.log("✅ Solicitação #2050 Família Silva criada");
  } else {
    console.log("• Solicitação #2050 já existe — pulando");
  }

  // Solicitantes
  const solicitantesData = [
    {
      uid: "01HX5APPBRUNO0000000000000",
      ordem: 1,
      nome: "Bruno Silva",
      parentesco: "Titular" as const,
      cpf: "111.222.333-44",
      etapa: "Triagem",
      status: "Doing",
    },
    {
      uid: "01HX5APPMARIA0000000000000",
      ordem: 2,
      nome: "Maria Silva",
      parentesco: "Cônjuge" as const,
      cpf: "222.333.444-55",
      etapa: "Documentação",
      status: "Todo",
    },
    {
      uid: "01HX5APPJOAO00000000000000",
      ordem: 3,
      nome: "João Silva",
      parentesco: "Filho(a)" as const,
      cpf: "333.444.555-66",
      etapa: "Triagem",
      status: "Todo",
    },
  ];

  for (const s of solicitantesData) {
    const exists = await db.query.solicitante.findFirst({
      where: eq(solicitante.uid, s.uid),
    });
    if (!exists) {
      await db.insert(solicitante).values({
        ...s,
        solicitacaoUid,
      });
      console.log(`✅ Solicitante ${s.nome} criado`);
    }
  }

  // Share link
  const token = "a3f9b2c1d4e5f678";
  const existingLink = await db.query.shareLink.findFirst({
    where: eq(shareLink.token, token),
  });
  if (!existingLink) {
    await db.insert(shareLink).values({
      token,
      solicitacaoUid,
      createdBy: masterRow.id,
    });
    console.log(`✅ Share link ${token} criado`);
  } else {
    console.log("• Share link já existe — pulando");
  }

  console.log("✅ Seed concluído");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
