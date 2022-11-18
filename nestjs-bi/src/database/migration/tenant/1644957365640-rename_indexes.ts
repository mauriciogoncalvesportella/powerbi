import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class renameIndexes1644957365640 implements MigrationInterface {
    name = 'renameIndexes1644957365640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_3e1c54b969c4573897c80b8e41"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_d694beec788823291be82fb93b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_363b5415c5af452733f035eebc"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_ae745996de073e1526ca3c2622"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_86f0f98bc7651ff744f0eb0fd2"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_953dfd7c53b0e41fdb32724274"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_a21f38f1aeb7799bbd92f2f447"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_09300c5290c51987cb130f9713"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_95ad51f9f2688e9d6df1122d21"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_2ce6d10f5a1c48775e8965247b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_50513de71f65fb09f062e71805"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_1c91bbd83f2971ca65cb528cf5"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_36d82fc15ad3dd2c034241ea65"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_02321b3e226b59c37f64ff6768"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_7087984d03632258baa5f07810"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_fe5923e92153c8b9cfc00e935b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_38f1e4f1c9ecadf0038b5ff0a9"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_14183d52190d756a5a2abb5a7d"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_8a52a82a9caf7e354208899893"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_4e0d5b300936a7816382ee2cca"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_245ecf4b987c4dac1f2abd354b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_57fe9f5c78980b599acff4fd20"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_45e122eb8d9fbc78f253f0f88c"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_1f6cac2d59a8361263a046030e"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_7a0ddd1de1cc5af2ff9025a17d"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_0194ac46496a74a0d6cd84fd43"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_d6ce62b3ddce5e23a3cb7a5e16"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_64bf8b426f8380ed92bbf6cdda"`);
        await queryRunner.query(`CREATE INDEX "IDX_CADCAMPANHA_CDPRODUTO" ON "${schema}"."cad_campanha_produto" ("cdProduto") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADCAMPANHA_CDCAMPANHA" ON "${schema}"."cad_campanha_produto" ("cdCampanha") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADCAMPANHA_CDFABRICA" ON "${schema}"."cad_campanha" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADEMPRESAMETAMENSAL_IDMESANO" ON "${schema}"."cad_empresa_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADEMPRESAMETAMENSAL_CDEMPRESA" ON "${schema}"."cad_empresa_meta_mensal" ("cdEmpresa") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADEQUIPE_IDMESANO" ON "${schema}"."cad_equipe_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADEQUIPE_CDEQUIPE" ON "${schema}"."cad_equipe_meta_mensal" ("cdEquipe") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADPRODUTO_CDCATEGORIA" ON "${schema}"."cad_produto" ("cdCategoria") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADPRODUTO_CDFABRICA" ON "${schema}"."cad_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADSUBTABELA_CDTABELAPRECO" ON "${schema}"."cad_subtabela" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADVENDEDOR_IDMESANO" ON "${schema}"."cad_vendedor_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADVENDEDOR_CDVENDEDOR" ON "${schema}"."cad_vendedor_meta_mensal" ("cdVendedor") `);
        await queryRunner.query(`CREATE INDEX "IDX_CADVENDEDOR_CDEQUIPE" ON "${schema}"."cad_vendedor" ("cdEquipe") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_IDMESANO" ON "${schema}"."vd_pedido_produto" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_CDPEDIDO" ON "${schema}"."vd_pedido_produto" ("cdPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_CDPRODUTO" ON "${schema}"."vd_pedido_produto" ("cdProduto") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_CDTABELAPRECO" ON "${schema}"."vd_pedido_produto" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_CDSUBTABELA" ON "${schema}"."vd_pedido_produto" ("cdSubtabela") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOPRODUTO_CDFABRICA" ON "${schema}"."vd_pedido_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_IDMESANO" ON "${schema}"."vd_pedidos" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_FGSITUACAO" ON "${schema}"."vd_pedidos" ("fgSituacao") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDTIPOPEDIDO" ON "${schema}"."vd_pedidos" ("cdTipoPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDEMPRESA" ON "${schema}"."vd_pedidos" ("cdEmpresa") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDVENDEDOR" ON "${schema}"."vd_pedidos" ("cdVendedor") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDCLIENTE" ON "${schema}"."vd_pedidos" ("cdCliente") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDCONDICAOPAGAMENTO" ON "${schema}"."vd_pedidos" ("cdCondicaoPagamento") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_DTEMISSAO" ON "${schema}"."vd_pedidos" ("dtEmissao") `);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_DTENTREGA" ON "${schema}"."vd_pedidos" ("dtEntrega") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_DTENTREGA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_DTEMISSAO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDCONDICAOPAGAMENTO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDCLIENTE"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDVENDEDOR"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDEMPRESA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDTIPOPEDIDO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_FGSITUACAO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_IDMESANO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_CDFABRICA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_CDSUBTABELA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_CDTABELAPRECO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_CDPRODUTO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_CDPEDIDO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOPRODUTO_IDMESANO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADVENDEDOR_CDEQUIPE"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADVENDEDOR_CDVENDEDOR"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADVENDEDOR_IDMESANO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADSUBTABELA_CDTABELAPRECO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADPRODUTO_CDFABRICA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADPRODUTO_CDCATEGORIA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADEQUIPE_CDEQUIPE"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADEQUIPE_IDMESANO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADEMPRESAMETAMENSAL_CDEMPRESA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADEMPRESAMETAMENSAL_IDMESANO"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADCAMPANHA_CDFABRICA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADCAMPANHA_CDCAMPANHA"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADCAMPANHA_CDPRODUTO"`);
        await queryRunner.query(`CREATE INDEX "IDX_64bf8b426f8380ed92bbf6cdda" ON "${schema}"."vd_pedidos" ("dtEntrega") `);
        await queryRunner.query(`CREATE INDEX "IDX_d6ce62b3ddce5e23a3cb7a5e16" ON "${schema}"."vd_pedidos" ("dtEmissao") `);
        await queryRunner.query(`CREATE INDEX "IDX_0194ac46496a74a0d6cd84fd43" ON "${schema}"."vd_pedidos" ("cdCondicaoPagamento") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a0ddd1de1cc5af2ff9025a17d" ON "${schema}"."vd_pedidos" ("cdCliente") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f6cac2d59a8361263a046030e" ON "${schema}"."vd_pedidos" ("cdVendedor") `);
        await queryRunner.query(`CREATE INDEX "IDX_45e122eb8d9fbc78f253f0f88c" ON "${schema}"."vd_pedidos" ("cdEmpresa") `);
        await queryRunner.query(`CREATE INDEX "IDX_57fe9f5c78980b599acff4fd20" ON "${schema}"."vd_pedidos" ("cdTipoPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_245ecf4b987c4dac1f2abd354b" ON "${schema}"."vd_pedidos" ("fgSituacao") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e0d5b300936a7816382ee2cca" ON "${schema}"."vd_pedidos" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_8a52a82a9caf7e354208899893" ON "${schema}"."vd_pedido_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_14183d52190d756a5a2abb5a7d" ON "${schema}"."vd_pedido_produto" ("cdSubtabela") `);
        await queryRunner.query(`CREATE INDEX "IDX_38f1e4f1c9ecadf0038b5ff0a9" ON "${schema}"."vd_pedido_produto" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe5923e92153c8b9cfc00e935b" ON "${schema}"."vd_pedido_produto" ("cdProduto") `);
        await queryRunner.query(`CREATE INDEX "IDX_7087984d03632258baa5f07810" ON "${schema}"."vd_pedido_produto" ("cdPedido") `);
        await queryRunner.query(`CREATE INDEX "IDX_02321b3e226b59c37f64ff6768" ON "${schema}"."vd_pedido_produto" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_36d82fc15ad3dd2c034241ea65" ON "${schema}"."cad_vendedor" ("cdEquipe") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c91bbd83f2971ca65cb528cf5" ON "${schema}"."cad_vendedor_meta_mensal" ("cdVendedor") `);
        await queryRunner.query(`CREATE INDEX "IDX_50513de71f65fb09f062e71805" ON "${schema}"."cad_vendedor_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_2ce6d10f5a1c48775e8965247b" ON "${schema}"."cad_subtabela" ("cdTabelaPreco") `);
        await queryRunner.query(`CREATE INDEX "IDX_95ad51f9f2688e9d6df1122d21" ON "${schema}"."cad_produto" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_09300c5290c51987cb130f9713" ON "${schema}"."cad_produto" ("cdCategoria") `);
        await queryRunner.query(`CREATE INDEX "IDX_a21f38f1aeb7799bbd92f2f447" ON "${schema}"."cad_equipe_meta_mensal" ("cdEquipe") `);
        await queryRunner.query(`CREATE INDEX "IDX_953dfd7c53b0e41fdb32724274" ON "${schema}"."cad_equipe_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_86f0f98bc7651ff744f0eb0fd2" ON "${schema}"."cad_empresa_meta_mensal" ("cdEmpresa") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae745996de073e1526ca3c2622" ON "${schema}"."cad_empresa_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_363b5415c5af452733f035eebc" ON "${schema}"."cad_campanha" ("cdFabrica") `);
        await queryRunner.query(`CREATE INDEX "IDX_d694beec788823291be82fb93b" ON "${schema}"."cad_campanha_produto" ("cdCampanha") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e1c54b969c4573897c80b8e41" ON "${schema}"."cad_campanha_produto" ("cdProduto") `);
    }

}
