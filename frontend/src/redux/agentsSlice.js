import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios.js'

export const fetchAgents = createAsyncThunk('agents/fetchAgents', async () => {
  const { data } = await api.get('/api/agents/agents')
  return data
})

export const createAgent = createAsyncThunk('agents/createAgent', async (agentData) => {
  const { data } = await api.post('/api/agents/agents', agentData)
  return data
})

export const updateAgent = createAsyncThunk('agents/updateAgent', async ({ id, ...updates }) => {
  const { data } = await api.put(`/api/agents/agents/${id}`, updates)
  return data
})

export const deleteAgent = createAsyncThunk('agents/deleteAgent', async (id) => {
  await api.delete(`/api/agents/agents/${id}`)
  return id
})

export const seedDefaultAgents = createAsyncThunk('agents/seedDefaults', async () => {
  const { data } = await api.post('/api/agents/agents/seed')
  return data.agents
})

export const sendMessage = createAsyncThunk('agents/sendMessage', async ({ message, conversationId, agentId }) => {
  const { data } = await api.post('/api/agents/chat', { message, conversationId, agentId })
  return data
})

export const fetchConversations = createAsyncThunk('agents/fetchConversations', async () => {
  const { data } = await api.get('/api/agents/conversations')
  return data
})

export const fetchConversation = createAsyncThunk('agents/fetchConversation', async (id) => {
  const { data } = await api.get(`/api/agents/conversations/${id}`)
  return data
})

export const deleteConversation = createAsyncThunk('agents/deleteConversation', async (id) => {
  await api.delete(`/api/agents/conversations/${id}`)
  return id
})

const agentsSlice = createSlice({
  name: 'agents',
  initialState: {
    agents: [],
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    streaming: false,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setStreaming: (state, action) => {
      state.streaming = action.payload
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null
      state.messages = []
    },
    appendStreamChunk: (state, action) => {
      const lastMsg = state.messages[state.messages.length - 1]
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
        lastMsg.content += action.payload
      } else {
        state.messages.push({ role: 'assistant', content: action.payload, streaming: true })
      }
    },
    finalizeStream: (state) => {
      const lastMsg = state.messages[state.messages.length - 1]
      if (lastMsg) lastMsg.streaming = false
      state.streaming = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agents = action.payload
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.agents.push(action.payload)
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        const idx = state.agents.findIndex(a => a._id === action.payload._id)
        if (idx !== -1) state.agents[idx] = action.payload
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter(a => a._id !== action.payload)
      })
      .addCase(seedDefaultAgents.fulfilled, (state, action) => {
        state.agents = action.payload
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload
        state.messages = action.payload.messages || []
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c._id !== action.payload)
        if (state.currentConversation?._id === action.payload) {
          state.currentConversation = null
          state.messages = []
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push({ role: 'assistant', content: action.payload.message })
        if (action.payload.conversationId) {
          const conv = state.conversations.find(c => c._id === action.payload.conversationId)
          if (conv) conv.updatedAt = new Date().toISOString()
        }
      })
  }
})

export const { addMessage, setStreaming, clearCurrentConversation, appendStreamChunk, finalizeStream } = agentsSlice.actions
export default agentsSlice.reducer