"use strict";

var SiemplifyEndpoints = (function () {
	
	var LOGIN_URL = "/#/login";
	var CASES_URL = "/#/main/cases";

	var API_CHECK_SESSION = "/api/external/v1/accounts/CheckSession?format=camel";
	var API_LOGIN_LDAP = "/api/external/v1/accounts/LoginLdap?format=camel";
	var API_CASE_SEARCH_EVERYTHING = "/api/external/v1/search/CaseSearchEverything?format=camel";
	var API_EXECUTE_BULK_ASSIGN = "/api/external/v1/cases/ExecuteBulkAssign?format=camel";
	var API_GET_CASE_CARDS_BY_REQUEST = "/api/external/v1/cases/GetCaseCardsByRequest?format=camel";
	var API_GET_CASE_FULL_DETAILS = "/api/external/v1/cases/GetCaseFullDetails/";
	var API_GET_USER_NOTIFICATIONS = "/api/external/v1/notifications/GetUserNotifications?format=camel";
	var API_GET_ENTITY_DATA = "/api/external/v1/entities/GetEntityData?format=camel";
	var API_GET_USER_PROFILES = "/api/external/v1/settings/GetUserProfiles?format=camel";
	var API_GET_WORKFLOW_MENU_CARDS = "/api/external/v1/playbooks/GetWorkflowMenuCards?format=camel";
	var API_GET_WORKFLOW_FULL_INFO_BY_IDENTIFIER = "/api/external/v1/playbooks/GetWorkflowFullInfoByIdentifier/";
	var API_SAVE_WORKFLOW_DEFINITIONS = "/api/external/v1/playbooks/SaveWorkflowDefinitions?format=camel";
	var API_GET_PLAYBOOKS_USING_BLOCKS = "/api/external/v1/playbooks/GetPlaybooksUsingBlocks?format=camel";
	var API_SAVE_LOG_VERSION_OF_WORKFLOW_DEFINITIONS = "/api/external/v1/playbooks/SaveLogVersionOfWorkflowDefinitions";
	var API_CREATE_SIMULATED_CUSTOM_CASE = "/api/external/v1/attackssimulator/CreateSimulatedCustomCase?format=camel";
	var API_IMPORT_CUSTOM_CASE = "/api/external/v1/attackssimulator/ImportCustomCase?format=camel";
	var API_GET_CONNECTORS_DATA = "/api/external/v1/connectors/GetConnectorsData?format=camel";
	var API_ADD_OR_UPDATE_LOCAL_USECASE = "/api/external/v1/store/AddOrUpdateLocalUsecase?format=camel";
	var API_EXPORT_USECASE = "/api/external/v1/store/ExportUseCase?format=camel";
	var API_GET_SYSTEM_VERSION = "/api/external/v1/settings/GetSystemVersion?format=camel";
	var API_REFRESH_TOKEN = "/api/external/v1/accounts/RefreshToken/"
    
    return {
		LOGIN_URL: LOGIN_URL,
		CASES_URL: CASES_URL,

        API_CHECK_SESSION: API_CHECK_SESSION,
        API_LOGIN_LDAP: API_LOGIN_LDAP,
        API_CASE_SEARCH_EVERYTHING: API_CASE_SEARCH_EVERYTHING,
        API_EXECUTE_BULK_ASSIGN: API_EXECUTE_BULK_ASSIGN,
		API_GET_CASE_CARDS_BY_REQUEST: API_GET_CASE_CARDS_BY_REQUEST,
		API_GET_CASE_FULL_DETAILS: API_GET_CASE_FULL_DETAILS,
        API_GET_USER_NOTIFICATIONS: API_GET_USER_NOTIFICATIONS,
        API_GET_ENTITY_DATA: API_GET_ENTITY_DATA,
		API_GET_USER_PROFILES: API_GET_USER_PROFILES,
		API_GET_WORKFLOW_MENU_CARDS: API_GET_WORKFLOW_MENU_CARDS,
		API_GET_WORKFLOW_FULL_INFO_BY_IDENTIFIER: API_GET_WORKFLOW_FULL_INFO_BY_IDENTIFIER,
		API_SAVE_WORKFLOW_DEFINITIONS: API_SAVE_WORKFLOW_DEFINITIONS,
		API_GET_PLAYBOOKS_USING_BLOCKS: API_GET_PLAYBOOKS_USING_BLOCKS,
		API_SAVE_LOG_VERSION_OF_WORKFLOW_DEFINITIONS: API_SAVE_LOG_VERSION_OF_WORKFLOW_DEFINITIONS,
		API_CREATE_SIMULATED_CUSTOM_CASE: API_CREATE_SIMULATED_CUSTOM_CASE,
		API_IMPORT_CUSTOM_CASE: API_IMPORT_CUSTOM_CASE,
		API_GET_CONNECTORS_DATA: API_GET_CONNECTORS_DATA,
		API_ADD_OR_UPDATE_LOCAL_USECASE: API_ADD_OR_UPDATE_LOCAL_USECASE,
		API_EXPORT_USECASE: API_EXPORT_USECASE,
		API_GET_SYSTEM_VERSION: API_GET_SYSTEM_VERSION,
		API_REFRESH_TOKEN: API_REFRESH_TOKEN
	};
	
}());
