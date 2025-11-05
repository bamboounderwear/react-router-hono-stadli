import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
        index("routes/home.tsx"),
        route("team", "routes/team.tsx"),
        route("news", "routes/news.tsx", [route(":slug", "routes/news.$slug.tsx")]),
        route("games", "routes/games.tsx", [route(":id", "routes/games.$id.tsx")]),
        route("shop", "routes/shop.tsx", [route(":id", "routes/shop.$id.tsx")]),
] satisfies RouteConfig;
