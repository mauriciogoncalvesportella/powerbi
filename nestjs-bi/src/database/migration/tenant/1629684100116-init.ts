import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class init1629684100116 implements MigrationInterface {
    name = 'init1629684100116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_campanha_produto" ("cd" integer NOT NULL, "cdProduto" integer NOT NULL, "cdCampanha" integer NOT NULL, "qtProduto" smallint NOT NULL, "vlUnitario" numeric(10,2) NOT NULL, "vlTotal" numeric(10,2) NOT NULL, CONSTRAINT "PK_1c582c6a045c123a1d44247ce58" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3e1c54b969c4573897c80b8e41" ON "${schema}"."cad_campanha_produto" ("cdProduto") `);
        await queryRunner.query(`CREATE INDEX "IDX_d694beec788823291be82fb93b" ON "${schema}"."cad_campanha_produto" ("cdCampanha") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_campanha" ("cd" integer NOT NULL, "nmCampanha" character varying(50) NOT NULL, "cdFabrica" integer, "dtInicio" TIMESTAMP NOT NULL, "dtFinal" TIMESTAMP NOT NULL, "fgAtivo" smallint NOT NULL, "vlCampanha" numeric(10,2) NOT NULL, "qtPositivacao" smallint NOT NULL, "vlBonus" numeric(10,2) NOT NULL, CONSTRAINT "PK_dee8c7c8320830e3d4a52fcd1ce" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_363b5415c5af452733f035eebc" ON "${schema}"."cad_campanha" ("cdFabrica") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_categoria" ("cd" integer NOT NULL, "idCategoria" character varying(50) NOT NULL, "nmCategoria" character varying(50) NOT NULL, "cdCategoriaPai" integer, CONSTRAINT "PK_826f778b481e12f467567d085ac" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_cliente" ("cd" integer NOT NULL, "idCliente" character varying(50) NOT NULL, "idCnpjCpf" character varying(50) NOT NULL, "idFantasia" character varying(50) NOT NULL, "nmRazao" character varying(256) NOT NULL, "cdVendedor" integer, "nmBairro" character varying(256) NOT NULL, "nmCidade" character varying(256) NOT NULL, "idEstado" character varying(50) NOT NULL, "nmContato" character varying(256) NOT NULL, "idFone" character varying(50) NOT NULL, "idFone2" character varying(50) NOT NULL, "idCelular" character varying(50) NOT NULL, "vlLimiteCredito" numeric(10,2) NOT NULL, "vlDesconto" numeric(10,2) NOT NULL, "vlRapel" numeric(10,2) NOT NULL, "dtCriacao" TIMESTAMP, "dtAtualizacao" TIMESTAMP, CONSTRAINT "PK_92a512642fa85721d7002fd58b6" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_condicao_pagamento" ("cd" integer NOT NULL, "idCondicao" character varying(5) NOT NULL, "nmCondicao" character varying(50) NOT NULL, "qtParcelas" smallint NOT NULL, "nrPrazoMedio" smallint NOT NULL, CONSTRAINT "PK_dd197348708e3a7f4395f927b7a" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_empresa_meta_mensal" ("idMesAno" character varying(7) NOT NULL, "cdEmpresa" integer NOT NULL, "pcCustoOperacional" numeric(5,2) NOT NULL, "pcLucroIdeal" numeric(5,2) NOT NULL, "fgBaseFat" smallint NOT NULL, "vlMetaVenda" numeric(10,2) NOT NULL, "vlBonusMetaVenda" numeric(10,2) NOT NULL, "pcBonusMetaVenda" numeric(5,2) NOT NULL, "vlBonusMetaClienteNovo" numeric(10,2) NOT NULL, "pcBonusMetaClienteNovo" numeric(5,2) NOT NULL, "qtMetaClienteNovo" integer NOT NULL, "vlBonusPositivacao" numeric(10,2) NOT NULL, "pcBonusPositivacao" numeric(5,2) NOT NULL, "qtBonusPositivacao" integer NOT NULL, "vlBonusMarkup" numeric(10,2) NOT NULL, "pcBonusMarkup" numeric(5,2) NOT NULL, "qtBonusMarkup" integer NOT NULL, CONSTRAINT "PK_f915970ed11171f8b803350d5f3" PRIMARY KEY ("idMesAno", "cdEmpresa"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae745996de073e1526ca3c2622" ON "${schema}"."cad_empresa_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_86f0f98bc7651ff744f0eb0fd2" ON "${schema}"."cad_empresa_meta_mensal" ("cdEmpresa") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_empresa" ("cd" integer NOT NULL, "idFantasia" character varying(50) NOT NULL, "nmRazao" character varying(70) NOT NULL, "idCnpj" character varying(14) NOT NULL, CONSTRAINT "UQ_IDCNPJ" UNIQUE ("idCnpj"), CONSTRAINT "PK_1c07f41c43c74690583373330e8" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_equipe_meta_mensal" ("idMesAno" character varying(7) NOT NULL, "cdEquipe" integer NOT NULL, "vlMetaVenda" numeric(10,2) NOT NULL, "vlBonusMetaVenda" numeric(10,2) NOT NULL, "pcBonusMetaVenda" numeric(5,2) NOT NULL, "vlBonusMetaClienteNovo" numeric(10,2) NOT NULL, "pcBonusMetaClienteNovo" numeric(5,2) NOT NULL, "qtMetaClienteNovo" integer NOT NULL, "vlBonusPositivacao" numeric(10,2) NOT NULL, "pcBonusPositivacao" numeric(5,2) NOT NULL, "qtBonusPositivacao" integer NOT NULL, "vlBonusMarkup" numeric(10,2) NOT NULL, "pcBonusMarkup" numeric(5,2) NOT NULL, "qtBonusMarkup" integer NOT NULL, CONSTRAINT "UQ_IDMESANO_CDEQUIPE" UNIQUE ("idMesAno", "cdEquipe"), CONSTRAINT "PK_a281854e7dc012609406089b137" PRIMARY KEY ("idMesAno", "cdEquipe"))`);
        await queryRunner.query(`CREATE INDEX "IDX_953dfd7c53b0e41fdb32724274" ON "${schema}"."cad_equipe_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_a21f38f1aeb7799bbd92f2f447" ON "${schema}"."cad_equipe_meta_mensal" ("cdEquipe") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_equipe" ("cd" integer NOT NULL, "idEquipe" character varying(50) NOT NULL, "cdEquipePai" integer, "cdResponsavel" integer, "nmEquipe" character varying(50) NOT NULL, CONSTRAINT "UQ_IDEQUIPE" UNIQUE ("idEquipe"), CONSTRAINT "PK_9e1fb136cb999e987e5655bba5c" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_fabrica" ("cd" integer NOT NULL, "idFabrica" character varying(50) NOT NULL, "nmFabrica" character varying(256) NOT NULL, "vlMetaVenda" numeric(10,2) NOT NULL, "nrLeadtimeCompra" smallint NOT NULL, "nrLeadtimeEntrega" smallint NOT NULL, CONSTRAINT "PK_e6c27063628238dd613e63d4165" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_geral_meta_mensal" ("idMesAno" character varying(7) NOT NULL, "vlMetaVenda" numeric(10,2) NOT NULL, "vlBonusMetaVenda" numeric(10,2) NOT NULL, "pcBonusMetaVenda" numeric(5,2) NOT NULL, "vlBonusMetaClienteNovo" numeric(10,2) NOT NULL, "pcBonusMetaClienteNovo" numeric(5,2) NOT NULL, "qtMetaClienteNovo" integer NOT NULL, "vlBonusPositivacao" numeric(10,2) NOT NULL, "pcBonusPositivacao" numeric(5,2) NOT NULL, "qtBonusPositivacao" integer NOT NULL, "vlBonusMarkup" numeric(10,2) NOT NULL, "pcBonusMarkup" numeric(5,2) NOT NULL, "qtBonusMarkup" integer NOT NULL, "pcLucroIdeal" numeric(5,2) NOT NULL, CONSTRAINT "PK_e3893ca6a1d7842a2f36f27eb4c" PRIMARY KEY ("idMesAno"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_produto" ("cd" integer NOT NULL, "idProduto" character varying(20) NOT NULL, "cdCategoria" integer, "cdFabrica" integer, "nmProduto" character varying(256) NOT NULL, "idUnidadeVenda" character varying(50), "qtVenda" numeric(10,4), "idUnidadeCompra" character varying(50), "qtUnidadeCompra" numeric(10,4), "vlCusto" numeric(10,2), "vlVenda" numeric(10,2), "idABC" character(1), "pcCredIcms" numeric(10,2), CONSTRAINT "PK_4b417e3603a9786d619724281f1" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09300c5290c51987cb130f9713" ON "${schema}"."cad_produto" ("cdCategoria") `);
        await queryRunner.query(`CREATE INDEX "IDX_95ad51f9f2688e9d6df1122d21" ON "${schema}"."cad_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_subtabela" ("cd" integer NOT NULL, "cdTabelaPreco" integer NOT NULL, "idTabela" character varying(50) NOT NULL, "pcDesconto" numeric(5,2) NOT NULL, "pcComissao" numeric(5,2) NOT NULL, "pcMinimoVolume" numeric(5,2) NOT NULL, CONSTRAINT "PK_034bafee1ca511116e15836ac02" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2ce6d10f5a1c48775e8965247b" ON "${schema}"."cad_subtabela" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_tabela_preco" ("cd" integer NOT NULL, "nmTabelaPreco" character varying(50) NOT NULL, "fgPromocao" smallint NOT NULL, "dtInicio" TIMESTAMP NOT NULL, "dtFinal" TIMESTAMP NOT NULL, CONSTRAINT "PK_9ba98e3968e284b4d61a072944c" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_tipo_pedido" ("cd" integer NOT NULL, "nmTipo" character varying(50) NOT NULL, "fgGeraFat" smallint NOT NULL, "fgDescontoFlex" smallint NOT NULL, "fgComissao" smallint NOT NULL, CONSTRAINT "PK_0cd2f37d32f957580089b9494b2" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_vendedor" ("cd" integer NOT NULL, "cdEquipe" integer NOT NULL, "idVendedor" character varying(50) NOT NULL, "nmVendedor" character varying(50) NOT NULL, "idEmail" character varying(256) NOT NULL, "fgAtivo" boolean NOT NULL, "fgFuncao" smallint NOT NULL, "jsMetaMensal" json, "vlMetaMensal" numeric(10,2) NOT NULL, CONSTRAINT "PK_c1ec4b13143605adfe9e73d9b13" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36d82fc15ad3dd2c034241ea65" ON "${schema}"."cad_vendedor" ("cdEquipe") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."vd_pedido_produto" ("cd" integer NOT NULL, "idMesAno" character(7) NOT NULL, "cdPedido" integer NOT NULL, "cdProduto" integer NOT NULL, "cdTabelaPreco" integer, "cdSubtabela" integer, "cdFabrica" integer, "qtProduto" double precision NOT NULL, "vlUnitario" numeric(10,2) NOT NULL, "vlTotal" numeric(10,2) NOT NULL, "vlDesconto" numeric(10,2) NOT NULL, "vlIpi" numeric(10,2) NOT NULL, "vlIcmsst" numeric(10,2) NOT NULL, "vlCusto" numeric(10,2) NOT NULL, "pcMarkup" numeric(10,2) NOT NULL, "pcLucro" numeric(10,2) NOT NULL, "vlLucro" numeric(10,2) NOT NULL, "fgSituacao" smallint NOT NULL, CONSTRAINT "PK_44f2215491d20ecd597c11eb31d" PRIMARY KEY ("cd", "cdPedido"))`);
        await queryRunner.query(`CREATE INDEX "IDX_02321b3e226b59c37f64ff6768" ON "${schema}"."vd_pedido_produto" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_7087984d03632258baa5f07810" ON "${schema}"."vd_pedido_produto" ("cdPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe5923e92153c8b9cfc00e935b" ON "${schema}"."vd_pedido_produto" ("cdProduto") `);
        await queryRunner.query(`CREATE INDEX "IDX_38f1e4f1c9ecadf0038b5ff0a9" ON "${schema}"."vd_pedido_produto" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE INDEX "IDX_14183d52190d756a5a2abb5a7d" ON "${schema}"."vd_pedido_produto" ("cdSubtabela") `);
        await queryRunner.query(`CREATE INDEX "IDX_8a52a82a9caf7e354208899893" ON "${schema}"."vd_pedido_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE TABLE "${schema}"."vd_pedidos" ("cd" integer NOT NULL, "idMesAno" character(7) NOT NULL, "idPedido" character varying(50) NOT NULL, "idTablet" character varying(50) NOT NULL, "fgSituacao" smallint NOT NULL, "fgLiberado" smallint NOT NULL, "cdTipoPedido" integer NOT NULL, "cdEmpresa" integer NOT NULL, "cdVendedor" integer NOT NULL, "cdCliente" integer NOT NULL, "cdCondicaoPagamento" integer, "dtEmissao" TIMESTAMP NOT NULL, "dtEntrega" TIMESTAMP NOT NULL, "idNotaFiscal" character varying(50) NOT NULL, "vlProdutos" numeric(10,2) NOT NULL, "vlDesconto" numeric(10,2) NOT NULL, "vlRapel" numeric(10,2) NOT NULL, "vlIcmsst" numeric(10,2) NOT NULL, "vlIpi" numeric(10,2) NOT NULL, "vlFrete" numeric(10,2) NOT NULL, "fgTipoFrete" smallint NOT NULL, "pcComissao" numeric(10,2) NOT NULL, "vlComissao" numeric(10,2) NOT NULL, "vlCusto" numeric(10,2) NOT NULL, "pcMarkup" numeric(10,2) NOT NULL, "pcLucro" numeric(10,2) NOT NULL, "vlLucro" numeric(10,2) NOT NULL, CONSTRAINT "PK_b2b2337a2795bde31144f381b72" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e0d5b300936a7816382ee2cca" ON "${schema}"."vd_pedidos" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_245ecf4b987c4dac1f2abd354b" ON "${schema}"."vd_pedidos" ("fgSituacao") `);
        await queryRunner.query(`CREATE INDEX "IDX_57fe9f5c78980b599acff4fd20" ON "${schema}"."vd_pedidos" ("cdTipoPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_45e122eb8d9fbc78f253f0f88c" ON "${schema}"."vd_pedidos" ("cdEmpresa") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f6cac2d59a8361263a046030e" ON "${schema}"."vd_pedidos" ("cdVendedor") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a0ddd1de1cc5af2ff9025a17d" ON "${schema}"."vd_pedidos" ("cdCliente") `);
        await queryRunner.query(`CREATE INDEX "IDX_0194ac46496a74a0d6cd84fd43" ON "${schema}"."vd_pedidos" ("cdCondicaoPagamento") `);
        await queryRunner.query(`CREATE INDEX "IDX_d6ce62b3ddce5e23a3cb7a5e16" ON "${schema}"."vd_pedidos" ("dtEmissao") `);
        await queryRunner.query(`CREATE INDEX "IDX_64bf8b426f8380ed92bbf6cdda" ON "${schema}"."vd_pedidos" ("dtEntrega") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_64bf8b426f8380ed92bbf6cdda"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_d6ce62b3ddce5e23a3cb7a5e16"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_0194ac46496a74a0d6cd84fd43"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_7a0ddd1de1cc5af2ff9025a17d"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_1f6cac2d59a8361263a046030e"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_45e122eb8d9fbc78f253f0f88c"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_57fe9f5c78980b599acff4fd20"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_245ecf4b987c4dac1f2abd354b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_4e0d5b300936a7816382ee2cca"`);
        await queryRunner.query(`DROP TABLE "${schema}"."vd_pedidos"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_8a52a82a9caf7e354208899893"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_14183d52190d756a5a2abb5a7d"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_38f1e4f1c9ecadf0038b5ff0a9"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_fe5923e92153c8b9cfc00e935b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_7087984d03632258baa5f07810"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_02321b3e226b59c37f64ff6768"`);
        await queryRunner.query(`DROP TABLE "${schema}"."vd_pedido_produto"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_36d82fc15ad3dd2c034241ea65"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_vendedor"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_tipo_pedido"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_tabela_preco"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_2ce6d10f5a1c48775e8965247b"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_subtabela"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_95ad51f9f2688e9d6df1122d21"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_09300c5290c51987cb130f9713"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_produto"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_geral_meta_mensal"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_fabrica"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_equipe"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_a21f38f1aeb7799bbd92f2f447"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_953dfd7c53b0e41fdb32724274"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_equipe_meta_mensal"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_empresa"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_86f0f98bc7651ff744f0eb0fd2"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_ae745996de073e1526ca3c2622"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_empresa_meta_mensal"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_condicao_pagamento"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_cliente"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_categoria"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_363b5415c5af452733f035eebc"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_campanha"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_d694beec788823291be82fb93b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_3e1c54b969c4573897c80b8e41"`);
        await queryRunner.query(`DROP TABLE "${schema}"."cad_campanha_produto"`);
    }
}
