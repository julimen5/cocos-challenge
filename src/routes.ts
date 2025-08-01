import { FastifyInstance } from "fastify";
import { portfolioRoutes } from "./modules/portfolio/portfolio.routes";
import { instrumentRoutes } from "./modules/instruments/instruments.routes";
import { orderRoutes } from "./modules/orders/orders.routes";

export const registerRoutes = async (app: FastifyInstance) => {
    await app.get('/', (req, res) => {
        res.send('Hello World');
    });
    await app.register(async (apiRoutes) => {
        await apiRoutes.register(portfolioRoutes, { prefix: '/portfolio' });
        await apiRoutes.register(instrumentRoutes, { prefix: '/instruments' });
        await apiRoutes.register(orderRoutes, { prefix: '/orders' });
    }, { prefix: '/api' });
};