const corsOptions = {
    origin: 'https://pasto-kinaliani.web.app',
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization"
}

export { corsOptions }