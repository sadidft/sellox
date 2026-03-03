type Handler = (...args: any[]) => any

export class EventBus {
  private handlers = new Map<string, Handler[]>()

  on(event: string, handler: Handler) {
    const list = this.handlers.get(event) || []
    list.push(handler)
    this.handlers.set(event, list)
  }

  async emit<T = any>(event: string, ...args: any[]): Promise<T[]> {
    const list = this.handlers.get(event) || []
    const results: T[] = []
    for (const handler of list) {
      const result = await handler(...args)
      if (result !== undefined && result !== null) {
        results.push(result)
      }
    }
    return results
  }

  listEvents(): string[] {
    return Array.from(this.handlers.keys())
  }
}
