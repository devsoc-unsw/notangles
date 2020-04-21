import defaults from '../constants/defaults'

const storageKey = 'data'

interface Data {
	[key: string]: any
}

const storage = new class {
	defaults: Data = defaults
	data: Data = {}

	get(key: string): any {
		if (key in this.data) {
			return this.data[key]
		} else if (key in this.defaults) {
			this.set(key, this.defaults[key])
			return this.defaults[key]
		}
	}

	set(key: string, value: any) {
		this.data[key] = value
		this.save()
	}

	load() {
		if (localStorage[storageKey]) {
			this.data = JSON.parse(localStorage[storageKey])
		} else {
			this.save()
		}
	}

	save() {
		localStorage[storageKey] = JSON.stringify(this.data)
	}
}

storage.load()

export default storage
