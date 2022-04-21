"use strict";

var CheckVersion = (function () {

	var enable = async function () {
		let configuredVersion = await getConfiguredSiemplifyVersion();
		let request = new SiemplifyApi.GetSystemVersion();
		request.addEventListener("load", () =>{
			let siemplifyVersion = request.response;
			if (siemplifyVersion) {
				compareVersions(siemplifyVersion, configuredVersion);
			}
		});
		request.send();
	};
	
	var disable = function () {
	};

	var getConfiguredSiemplifyVersion = async function() {
		let generalConfig = await ConfigurationManager.getHostConfig(location.hostname, "general");
		return generalConfig.siemplifyVersion;
	}

	var compareVersions = async function(siemplifyVersion, configuredVersion) {
		let allSupportedVersions = await MessagingManager.sendMessage("getSiemplifyVersions");

		let versionCandidates = [];
        for (let version of allSupportedVersions) {
            if (siemplifyVersion.startsWith(version)) {
                versionCandidates.push(version);
            }
		}
		
		if (versionCandidates.length == 0) {
			// Version not supported
		}
		else {
			versionCandidates.sort((a, b) => { return a.length - b.length });
		
			let bestVersion = versionCandidates.pop();
			if (configuredVersion != bestVersion) {
				console.log(`${configuredVersion} worse than ${bestVersion}`);
				openWarningModal(configuredVersion, bestVersion, siemplifyVersion);
			}
		}
	}

	var openWarningModal = function(configuredVersion, bestVersion, siemplifyVersion) {
		let content = document.createElement("div");
		let p1 = document.createElement("p");
		p1.textContent = "The siemplify Extension has detected that there are better versions of its modules available to use with this Siemplify instance.";
		let p2 = document.createElement("p");
		p2.textContent = `Currently using version ${configuredVersion}.x while ${bestVersion}.x is available. Detected Siemplify version: ${siemplifyVersion}`;
		let p3 = document.createElement("p");
		p3.textContent = "Use the better version instead?";
		content.appendChild(p1);
		content.appendChild(document.createElement("br"));
		content.appendChild(p2);
		content.appendChild(document.createElement("br"));
		content.appendChild(p3);

		let modal = new ModalHelper.Modal("The Siemplify Extension: Version Mismatch", content);

		modal.submitButton.addEventListener("click", () => updateConfig(bestVersion));

		modal.displayModal();
	}

	var updateConfig = async function(newVersion) {
		let generalConfig = await ConfigurationManager.getHostConfig(location.hostname, "general");
		generalConfig.siemplifyVersion = newVersion;
		await ConfigurationManager.setHostConfig(location.hostname, "general", generalConfig);
		location.reload();
	}

	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(CheckVersion, "Check Version");