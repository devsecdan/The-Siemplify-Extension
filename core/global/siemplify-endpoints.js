"use strict";

var SiemplifyEndpoints = (function () {
	
	var LOGIN_URL = "/#/login";
	var CASES_URL = "/#/main/cases";

	var API_CHECK_SESSION = "/api/external/v1/accounts/CheckSession?format=camel";
	var API_LOGIN_LDAP = "/api/external/v1/accounts/LoginLdap?format=camel";
	var API_CASE_SEARCH_EVERYTHING = "/api/external/v1/search/CaseSearchEverything?format=camel";
	var API_EXECUTE_BULK_ASSIGN = "/api/external/v1/cases/ExecuteBulkAssign?format=camel";
	var API_GET_CASE_CARDS_BY_REQUEST = "/api/external/v1/cases/GetCaseCardsByRequest?format=camel";
	var API_GET_CASE_FULL_DETAILS = "/api/external/v1/cases/GetCaseFullDetails/?format=camel";
	var API_GET_USER_NOTIFICATIONS = "/api/external/v1/notifications/GetUserNotifications?format=camel";
	var API_GET_ENTITY_DATA = "/api/external/v1/entities/GetEntityData?format=camel";
    var API_GET_USER_PROFILES = "/api/external/v1/settings/GetUserProfiles?format=camel";
    
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
		API_GET_USER_PROFILES: API_GET_USER_PROFILES
	};
	
}());