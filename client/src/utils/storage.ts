import defaults from '../constants/defaults'

const STORAGE_KEY = 'data'

const storage = new class {
	defaults: Record<string, any> = defaults

	get(key: string): any {
		const data: Record<string, any> = this.load()

		if (key in data) {
			return data[key]
		} else if (key in this.defaults) {
			this.set(key, this.defaults[key])
			return this.defaults[key]
		}

		return null
	}

	set(key: string, value: any) {
		let data: Record<string, any> = this.load()
		data[key] = value
		this.save(data)
	}

	load(): Record<string, any> {
		let data: Record<string, any> = {}

		if (localStorage[STORAGE_KEY]) {
			data = JSON.parse(localStorage[STORAGE_KEY])
		} else {
			this.save(data)
		}

		return data
	}

	save(data: Record<string, any>) {
		localStorage[STORAGE_KEY] = JSON.stringify(data)
	}
}

storage.load()

export default storage
