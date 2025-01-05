export class CardState {
    id = $state<number>(0);
    name = $state<string>('');
    settings = $state<Record<string, any>>({});
    values = $state<Record<string, any>>({});
  
    constructor(data?: any) {
      if (data) {
        this.id = data.id;
        this.name = data.name;
        this.settings = data.settings || {};
        this.values = data.values || {};
      }
    }
  
    setValue(settingName: string, value: any) {
      this.values[settingName] = value;
    }
  
    async save() {
      const response = await fetch(`/api/cards/${this.id}/values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.values)
      });
      return response.json();
    }
  }