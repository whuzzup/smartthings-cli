import Table from 'cli-table'

import { PresentationDevicePresentation } from '@smartthings/core-sdk'

import { OutputAPICommand } from '@smartthings/cli-lib'


export default class PresentationCommand extends OutputAPICommand<PresentationDevicePresentation> {
	static description = 'query device presentation by vid'

	static flags = OutputAPICommand.flags

	static args = [{
		name: 'vid',
		description: 'system generated identifier that corresponds to a device presentation',
		required: true,
	}]

	protected buildTableOutput(presentation: PresentationDevicePresentation): string {
		const table = new Table()
		table.push(['VID', presentation.vid])
		table.push(['MNMN', presentation.mnmn])
		if (presentation.iconUrl) {
			table.push(['Icon URL', presentation.iconUrl])
		}

		let dashboardStates = 'No dashboard states'
		if (presentation.dashboard?.states && presentation.dashboard.states.length > 0) {
			const subTable = new Table({ head: ['Label', 'Alternatives', 'Group'] })
			for (const state of presentation.dashboard.states) {
				const alternatives = state.alternatives?.length
					? state.alternatives.length
					: 'none'
				subTable.push([
					state.label,
					alternatives,
					state.group ? state.group : '',
				])
			}
			dashboardStates = `Dashboard States\n${subTable.toString()}`
		}

		function buildDisplayTypeTable(items: { displayType: string }[]): string {
			const subTable = new Table({ head: ['Display Type'] })
			for (const item of items) {
				subTable.push([item.displayType])
			}
			return subTable.toString()
		}

		function buildLabelDisplayTypeTable(items: { label: string; displayType: string }[]): string {
			const subTable = new Table({ head: ['Label', 'Display Type'] })
			for (const item of items) {
				subTable.push([item.label, item.displayType])
			}
			return subTable.toString()
		}

		let dashboardActions = 'No dashboard actions'
		if (presentation.dashboard?.actions?.length) {
			dashboardActions = `Dashboard Actions\n${buildDisplayTypeTable(presentation.dashboard.actions)}`
		}

		let dashboardBasicPlus = 'No dashboard basic plus items'
		if (presentation.dashboard?.basicPlus?.length) {
			dashboardBasicPlus = `Dashboard Basic Plus\n${buildDisplayTypeTable(presentation.dashboard.basicPlus)}`
		}

		let detailViews = 'No detail views'
		if (presentation.detailView?.length) {
			const subTable = new Table({ head: ['Capability', 'Version', 'Component'] })
			for (const detailView of presentation.detailView) {
				subTable.push([
					detailView.capability,
					detailView.version ? detailView.version : 'none',
					detailView.component,
				])
			}
			detailViews = `Detail Views\n${subTable.toString()}`
		}

		let automationConditions = 'No automation conditions'
		if (presentation.automation?.conditions?.length) {
			automationConditions = `Automation Conditions\n${buildLabelDisplayTypeTable(presentation.automation.conditions)}`
		}

		let automationActions = 'No automation actions'
		if (presentation.automation?.actions?.length) {
			automationActions = `Automation Actions\n${buildLabelDisplayTypeTable(presentation.automation.actions)}`
		}

		return `Basic Information\n${table.toString()}\n\n` +
			`${dashboardStates}\n\n` +
			`${dashboardActions}\n\n` +
			`${dashboardBasicPlus}\n\n` +
			`${detailViews}\n\n` +
			`${automationConditions}\n\n` +
			`${automationActions}\n\n` +
			'(Information is summarized, for full details use YAML or JSON flags.)'
	}

	async run(): Promise<void> {
		const { args, argv, flags } = this.parse(PresentationCommand)
		await super.setup(args, argv, flags)

		this.processNormally(() => {
			return this.client.presentation.getPresentation(args.vid)
		})
	}
}
