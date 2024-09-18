import {
	ApplicationCommandType,
	type ApplicationIntegrationType,
	type InteractionContextType,
	type LocalizationMap,
	type Permissions,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import type { RestOrArray } from '../../../util/normalizeArray.js';
import { normalizeArray } from '../../../util/normalizeArray.js';
import {
	contextsPredicate,
	integrationTypesPredicate,
	validateDMPermission,
	validateDefaultMemberPermissions,
	validateDefaultPermission,
	validateLocalizationMap,
	validateNSFW,
	validateRequiredParameters,
} from '../Assertions.js';
import type { ToAPIApplicationCommandOptions } from '../SlashCommandBuilder.js';

/**
 * This mixin holds symbols that can be shared in slashcommands independent of options or subcommands.
 */
export class SharedSlashCommand {
	public readonly name: string = undefined!;

	public readonly name_localizations?: LocalizationMap;

	public readonly description: string = undefined!;

	public readonly description_localizations?: LocalizationMap;

	public readonly options: ToAPIApplicationCommandOptions[] = [];

	public readonly contexts?: InteractionContextType[];

	/**
	 * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
	 */
	public readonly default_permission: boolean | undefined = undefined;

	public readonly default_member_permissions: Permissions | null | undefined = undefined;

	/**
	 * @deprecated Use {@link SharedSlashCommand.contexts} instead.
	 */
	public readonly dm_permission: boolean | undefined = undefined;

	public readonly integration_types?: ApplicationIntegrationType[];

	public readonly nsfw: boolean | undefined = undefined;

	/**
	 * Sets the contexts of this command.
	 *
	 * @param contexts - The contexts
	 */
	public setContexts(...contexts: RestOrArray<InteractionContextType>) {
		Reflect.set(this, 'contexts', contextsPredicate.parse(normalizeArray(contexts)));

		return this;
	}

	/**
	 * Sets the integration types of this command.
	 *
	 * @param integrationTypes - The integration types
	 */
	public setIntegrationTypes(...integrationTypes: RestOrArray<ApplicationIntegrationType>) {
		Reflect.set(this, 'integration_types', integrationTypesPredicate.parse(normalizeArray(integrationTypes)));

		return this;
	}

	/**
	 * Sets whether the command is enabled by default when the application is added to a guild.
	 *
	 * @remarks
	 * If set to `false`, you will have to later `PUT` the permissions for this command.
	 * @param value - Whether or not to enable this command by default
	 * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
	 * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
	 */
	public setDefaultPermission(value: boolean) {
		// Assert the value matches the conditions
		validateDefaultPermission(value);

		Reflect.set(this, 'default_permission', value);

		return this;
	}

	/**
	 * Sets the default permissions a member should have in order to run the command.
	 *
	 * @remarks
	 * You can set this to `'0'` to disable the command by default.
	 * @param permissions - The permissions bit field to set
	 * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
	 */
	public setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined) {
		// Assert the value and parse it
		const permissionValue = validateDefaultMemberPermissions(permissions);

		Reflect.set(this, 'default_member_permissions', permissionValue);

		return this;
	}

	/**
	 * Sets if the command is available in direct messages with the application.
	 *
	 * @remarks
	 * By default, commands are visible. This method is only for global commands.
	 * @param enabled - Whether the command should be enabled in direct messages
	 * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
	 * @deprecated
	 * Use {@link SharedSlashCommand.setContexts} instead.
	 */
	public setDMPermission(enabled: boolean | null | undefined) {
		// Assert the value matches the conditions
		validateDMPermission(enabled);

		Reflect.set(this, 'dm_permission', enabled);

		return this;
	}

	/**
	 * Sets whether this command is NSFW.
	 *
	 * @param nsfw - Whether this command is NSFW
	 */
	public setNSFW(nsfw = true) {
		// Assert the value matches the conditions
		validateNSFW(nsfw);
		Reflect.set(this, 'nsfw', nsfw);
		return this;
	}

	/**
	 * Serializes this builder to API-compatible JSON data.
	 *
	 * @remarks
	 * This method runs validations on the data before serializing it.
	 * As such, it may throw an error if the data is invalid.
	 */
	public toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		validateRequiredParameters(this.name, this.description, this.options);

		validateLocalizationMap(this.name_localizations);
		validateLocalizationMap(this.description_localizations);

		return {
			...this,
			type: ApplicationCommandType.ChatInput,
			options: this.options.map((option) => option.toJSON()),
		};
	}
}
