export const createLikeSchema = {
  tags: ["Likes"],
  summary: "Queue a like for processing",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    }
  },
  body: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", minLength: 1 }
    }
  },
  response: {
    202: {
      type: "object",
      properties: {
        message: { type: "string" },
        postId: { type: "string" },
        userId: { type: "string" }
      }
    },
    409: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  }
} as const;

export const getLikesCountSchema = {
  tags: ["Likes"],
  summary: "Get likes count for a post",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        postId: { type: "string" },
        likesCount: { type: "integer" }
      }
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  }
} as const;
