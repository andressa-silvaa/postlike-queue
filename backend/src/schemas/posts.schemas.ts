const postProperties = {
  id: { type: "string" },
  title: { type: "string" },
  content: { type: "string" },
  likesCount: { type: "integer" },
  createdAt: { type: "string", format: "date-time" }
} as const;

const postResponseSchema = {
  type: "object",
  properties: postProperties
} as const;

export const createPostSchema = {
  tags: ["Posts"],
  summary: "Create a new post",
  body: {
    type: "object",
    required: ["title", "content"],
    properties: {
      title: { type: "string", minLength: 1 },
      content: { type: "string", minLength: 1 }
    }
  },
  response: {
    201: postResponseSchema,
    400: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  }
} as const;

export const listPostsSchema = {
  tags: ["Posts"],
  summary: "List posts",
  response: {
    200: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: postResponseSchema
        }
      }
    }
  }
} as const;

export const getPostByIdSchema = {
  tags: ["Posts"],
  summary: "Get post by id",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    }
  },
  response: {
    200: postResponseSchema,
    404: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  }
} as const;

export const getTopLikedRankingSchema = {
  tags: ["Posts"],
  summary: "Get top liked posts ranking",
  response: {
    200: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: postResponseSchema
        },
        cached: { type: "boolean" }
      }
    }
  }
} as const;
