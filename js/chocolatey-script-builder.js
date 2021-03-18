(function() {
    jQuery(function () {
    var
        packages = localStorage.packageList === undefined ? new Array() : JSON.parse(localStorage.packageList),
        getStorage,
        storageTitle,
        storageVersion,
        storageImage,
        storageValue,
        storageButton,
        storageIdentity,
        current,
        packageUrl,
        packageImage,
        packageTitle,
        packageValue,
        packageVersion,
        packageButton,
        packageImagePath,
        packageIdentity,
        builderNextStep,
        builderPrevStep,
        internalRepoUrl;

    const
        builderStep1 = jQuery('#builder-step-1-tab'),
        builderStep3 = jQuery('#builder-step-3-tab'),
        builderStep4 = jQuery('.builder-step-4-tab'),
        builderStep5 = jQuery('.builder-step-5-tab'),
        builderIndividual = jQuery('.builder-individual'),
        builderOrganization = jQuery('.builder-organization'),
        builderModal = jQuery('#build-script'),
        builderScriptInput = jQuery('.internalRepoUrlInput'),
        builderStorage = jQuery('.storage'),
        builderViewBtn = jQuery('.btn-view-builder'),
        builderNextBtn = jQuery('.btn-next-step'),
        builderPrevBtn = jQuery('.btn-prev-step');


    // Find Url on Display Image & Add Class
    // TODO: See about moving this logic to DisplayPackage.cshtml instead
    if (jQuery('.package-logo').hasClass('package-image')) {
        if (jQuery('.btn-builder').attr('value').indexOf("--") >= 0) {
            current = jQuery('.btn-builder').attr('value').substr(0, jQuery('.btn-builder').attr('value').indexOf('--')).trim();
        }
        else {
            current = jQuery('.btn-builder').attr('value');
        }
        if (window.location.href.indexOf(current) > -1) {
            jQuery('.package-image').addClass(jQuery('.btn-builder').attr('title').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''));
        }
    }

    if (packages.length != 0) {
        builderViewBtn.removeClass('d-none');

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageTitle = getStorage[0];
            storageVersion = getStorage[1];
            storageImage = getStorage[2];
            storageValue = getStorage[3];
            storageButton = jQuery('.btn-builder[value="' + storageValue + '"]');
            storageIdentity = storageTitle.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');

            // Url
            if (storageValue.indexOf("--") >= 0) {
                packageUrl = storageValue.substr(0, storageValue.indexOf('--')).trim();
            }
            else {
                packageUrl = storageValue;
            }

            // Image Path
            if (storageImage == "packageDefaultIcon-50x50.png") {
                packageImagePath = "/Content/Images/";
            } else {
                packageImagePath = "/content/packageimages/";
            }

            if ((storageButton).length > 0) {
                packageIdentity = storageButton.attr('title').replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');

                // Update main list buttons
                storageButton.each(function () {
                    if (jQuery(this).hasClass('btn-builder-text')) {
                        jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span> Remove from Script Builder');
                    } else {
                        jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span>');
                    }
                });
                storageButton.removeClass('btn-success').addClass('btn-danger').addClass(packageIdentity);
            }

            // Generate Package List
            appendPackage(storageTitle, storageValue, storageIdentity, storageVersion, packageUrl, storageImage, packageImagePath);
        }

        // Count items
        countPackages();
    }

    // Button click inside of builder list
    removePackages();

    jQuery('.btn-builder').each(function () {
        jQuery(this).click(function () {
            packageTitle = jQuery(this).attr('title'),
            packageValue = jQuery(this).attr('value'),
            packageIdentity = packageTitle.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''),
            packageVersion = jQuery(this).attr('version'),
            packageButton = jQuery('.btn-builder[value="' + packageValue + '"]');

            // Find Url
            if (packageValue.indexOf("--") >= 0) {
                packageUrl = packageValue.substr(0, packageValue.indexOf('--')).trim();
            }
            else {
                packageUrl = packageValue;
            }

            // Find Image
            if (window.location.href.indexOf(packageUrl) > -1) {
                packageImage = /[^/]*$/.exec(jQuery(this).parentsUntil('body').parent().find('.package-image.' + packageIdentity).attr('src'))[0];
            } else {
                packageImage = /[^/]*$/.exec(jQuery(this).parentsUntil('.package-item').parent().find(".package-image").attr('src'))[0];
            }

            if (packageImage.indexOf("packageDefaultIcon") >= 0) {
                packageImage = "packageDefaultIcon-50x50.png";
            }

            // Determine if there is already a version of the package in their list
            for (var i in packages) {
                if (packages.length != 0 && jQuery(this).hasClass('btn-success')) {
                    getStorage = packages[i].split(" , ");
                    storageTitle = getStorage[0];
                    storageVersion = getStorage[1];
                    storageImage = getStorage[2];
                    storageValue = getStorage[3];
                    if (storageTitle == packageTitle) {
                        jQuery(this).addClass('active'); // Prevents from continueing on through the funtion and adding to builder
                        jQuery('.btn-version').attr('title', packageTitle).attr('image', packageImage).attr('version', packageVersion).attr('value', packageValue);
                        jQuery('.current-version').text(storageVersion);
                        jQuery('.new-version').text(packageVersion);
                        jQuery('#warning-version').modal('show');
                    }
                }
            }

            // If no value matching found, add or delete item
            // Delete items
            if (jQuery(this).hasClass('btn-danger') && !jQuery(this).hasClass('active')) {
                // Change button state
                packageButton.each(function () {
                    if (jQuery(this).hasClass('btn-builder-text')) {
                        jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span> Add to Script Builder');
                    } else {
                        jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span>');
                    }
                });
                packageButton.removeClass('btn-danger').addClass('btn-success').removeClass(packageIdentity);
                
                // Remove package from list
                jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).prev().remove();
                jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).remove();

                // Delete & Update TitleVersion from Storage
                for (var i in packages) {
                    if (packages[i] == packageTitle + " , " + packageVersion + " , " + packageImage + " , " + packageValue) {
                        packages.splice(i, 1);
                    }
                }
                localStorage.packageList = JSON.stringify(packages);

                // Storage
                removeStorage();

                // Count items
                countPackages();
            }

            // Add items
            else if (jQuery(this).hasClass('btn-success') && !jQuery(this).hasClass('active')) {
                // Save Title & Version to Storage
                packages.push(packageTitle + " , " + packageVersion + " , " + packageImage + " , " + packageValue);
                localStorage.packageList = JSON.stringify(packages);

                // Change button state
                packageButton.each(function () {
                    if (jQuery(this).hasClass('btn-builder-text')) {
                        jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span> Remove from Script Builder');
                    } else {
                        jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span>');
                    }
                });
                packageButton.removeClass('btn-success').addClass('btn-danger').addClass(packageIdentity);

                // Show builder tab
                builderViewBtn.removeClass('d-none');

                // Count items
                countPackages();

                // Find Image Path
                if (packageImage == "packageDefaultIcon-50x50.png") {
                    packageImagePath = "/Content/Images/";
                } else {
                    packageImagePath = "/content/packageimages/";
                }

                // Add package to list
                appendPackage(packageTitle, packageValue, packageIdentity, packageVersion, packageUrl, packageImage, packageImagePath);

                // Button click inside of builder list
                removePackages();
            }
        });
    });

    // Clicked to remove version and add new version
    jQuery('.btn-version').click(function () {
        packageTitle = jQuery(this).attr('title'),
        packageValue = jQuery(this).attr('value'),
        packageIdentity = packageTitle.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''),
        packageVersion = jQuery(this).attr('version'),
        packageButton = jQuery('.btn-builder[value="' + packageValue + '"]'),
        packageImage = jQuery(this).attr('image');

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageTitle = getStorage[0];

            // Delete current version
            if (storageTitle == packageTitle) {
                packages.splice(i, 1);
            }
        }

        // Add new version to storage
        packages.push(packageTitle + " , " + packageVersion + " , " + packageImage + " , " + packageValue);
        localStorage.packageList = JSON.stringify(packages);

        // Change button state on main page
        jQuery(".btn-builder." + packageIdentity).each(function () {
            if (jQuery(this).hasClass('btn-builder-text')) {
                jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span> Add to Script Builder');
            } else {
                jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span>');
            }
        });
        jQuery(".btn-builder." + packageIdentity).removeClass('btn-danger').addClass('btn-success').removeClass(packageIdentity);

        packageButton.each(function () {
            if (jQuery(this).hasClass('btn-builder-text')) {
                jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span> Remove from Script Builder');
            } else {
                jQuery(this).html('<span class="fas fa-minus-circle" alt="Remove from Script Builder"></span>');
            }
        });
        packageButton.removeClass('btn-success').addClass('btn-danger').addClass(packageIdentity);

        // Package List
        // Remove old version
        jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).prev().remove();
        jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).remove();

        // Add new version
        appendPackage(packageTitle, packageValue, packageIdentity, packageVersion, packageUrl, packageImage, packageImagePath);
        
        removePackages();
    });

    jQuery('#warning-version').on('hidden.bs.modal', function () {
        jQuery('.btn-builder.active').removeClass('active');
    });

    // Build Command Scripts
    builderModal.on('shown.bs.modal', function () {
        jQuery('code[class^="command-builder-"]').empty();
        builderIndividualScript();
        builderOrganizationScript();
        builderEnvironmentScript();
        jQuery('.copy-command .toolbar button').each(function () {
            var copyCommand = jQuery(this).parentsUntil('.code-toolbar').parent().find('code').attr('class').split(" ");
            jQuery(this).addClass('btn-copy').attr('data-clipboard-target', '.' + copyCommand[0]);
        });
    });

    builderStep3.on('shown.bs.tab', function () {
        jQuery('code.command-builder-individual').empty();
        builderIndividualScript();
    });

    builderStep4.find('a[data-bs-toggle="pill"]').on('shown.bs.tab', function () {
        jQuery('code[class^="command-builder-environment"]').empty()
        builderEnvironmentScript();
    });

    builderStep5.find('a[data-bs-toggle="pill"]').on('shown.bs.tab', function () {
        jQuery('code[class^="command-builder-organization"]').empty();
        builderOrganizationScript();
    });

    jQuery('.btn-bulk-package-download').click(function (e) {
        e.preventDefault();
        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageVersion = getStorage[1];
            storageValue = getStorage[3];

            window.open('https://community.chocolatey.org/api/v2/package/' + storageValue + '/' + storageVersion);
        }
    });

    // Build new xml doc based on local storage package values
    jQuery('.btn-xml').click(function () {
        var xmlDoc = document.implementation.createDocument(null, "packages");
        (new XMLSerializer()).serializeToString(xmlDoc);

        var parser = new DOMParser();
        prolog = '<?xml version="1.0" encoding="utf-8"?>';

        // Add prolog
        newXmlStr = prolog + (new XMLSerializer()).serializeToString(xmlDoc);
        var xml = parser.parseFromString(newXmlStr, "application/xml");

        // Build xml & add each package node
        var packagesObject = xml.getElementsByTagName("packages");

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageVersion = getStorage[1];
            storageValue = getStorage[3];
            // Creates a new package entry for each item in builder
            var packageNode = xml.createElement("package");
            packagesObject[0].appendChild(packageNode);

            // Determine attributes if either version or pre-release was specified
            if (storageValue.indexOf("--") >= 0) {
                if (storageValue.indexOf("--pre") >= 0) { // If a pre-release
                    storageVersion = storageValue.substr(storageValue.indexOf('--version') + 9).trim();
                    storageVersion = storageVersion.substr(0, storageVersion.indexOf('--')).trim();
                    storageValue = storageValue.substr(0, storageValue.indexOf('--')).trim();
                } else { // If version was specified and is not a pre-release
                    storageValue = storageValue.substr(0, storageValue.indexOf('--')).trim();
                }
                // Set attributes
                packageNode.setAttribute("id", storageValue);
                packageNode.setAttribute("version", storageVersion);
            } else { // No version specified and not a pre-release
                packageNode.setAttribute("id", storageValue);
            }
        }

        // Get xml doc as string
        var text = (new XMLSerializer()).serializeToString(xml);

        // Send off to beautify
        formatXml(text);
    });

    function builderEnvironmentScript() {
        internalRepoUrl = builderScriptInput.val() || "http://internal/odata/repo";
        var commandEnvironmentOne = jQuery('.command-builder-environment-one');
        var commandEnvironmentTwo = jQuery('.command-builder-environment-two');

        commandEnvironmentOne.append("choco download <span></span>--internalize --source=https://chocolatey.org/api/v2");
        commandEnvironmentTwo.append("choco push --source =\"'" + internalRepoUrl + "'\"");

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageValue = getStorage[3];

            // Command Environment One
            commandEnvironmentOne.find('span').append(storageValue + " ");
        }

        // Highlight Command Environment One & Two
        commandEnvironmentOne.add(commandEnvironmentTwo).addClass('language-powershell');
        Prism.highlightElement(commandEnvironmentOne[0]);
        Prism.highlightElement(commandEnvironmentTwo[0]);
    }

    function builderOrganizationScript() {
        internalRepoUrl = builderScriptInput.val() || "http://internal/odata/repo";
        var commandGenericOne = jQuery('.command-builder-organization-generic-one');
        var commandGenericTwo = jQuery('.command-builder-organization-generic-two');
        var commandAnsible = jQuery('.command-builder-organization-ansible');
        var commandChef = jQuery('.command-builder-organization-chef');
        var commandOtter = jQuery('.command-builder-organization-otter');
        var commandPSDSC = jQuery('.command-builder-organization-psdsc');
        var commandPuppet = jQuery('.command-builder-organization-puppet');
        var commandSalt = jQuery('.command-builder-organization-salt');

        // Command Generic Two
        commandGenericTwo.append(
            "$validExitCodes = @(0, 1605, 1614, 1641, 3010)\n\n" +
            "function Install-Package {\n" +
            "  param (\n" +
            "    [parameter(Mandatory=$true, Position=0)][string] $PackageName,\n" +
            "    [parameter(Mandatory=$false)][string] $Source,\n" +
            "    [parameter(Mandatory=$false)][alias(\"Params\")][string] $PackageParameters = '',\n" +
            "    [parameter(Mandatory=$false)][string] $Version = $null,\n" +
            "    [parameter(Mandatory=$false)][alias(\"Pre\")][switch] $Prerelease = $false,\n" +
            "    [parameter(Mandatory=$false)][switch] $UseInstallNotUpgrade = $false\n" +
            "  )\n\n" +
            "  $chocoExecutionArgs = \"choco.exe\"\n" +
            "  if ($UseInstallNotUpgrade) {\n" +
            "    $chocoExecutionArgs += \" install\"\n" +
            "  } else {\n" +
            "    $chocoExecutionArgs += \" upgrade\"\n" +
            "  }\n\n" +
            "  $chocoExecutionArgs += \" $PackageName -y --source='$Source'\"\n" +
            "  if ($Prerelease) { $chocoExecutionArgs += \" --prerelease\"}\n" +
            "  if ($Version) { $chocoExecutionArgs += \" --version='$Version'\"}\n" +
            "  if ($PackageParameters -and $PackageParameters -ne '') { $chocoExecutionArgs += \" --package-parameters='$PackageParameters'\"}\n\n" +
            "  Invoke-Expression -Command $chocoExecutionArgs\n" +
            "  $exitCode = $LASTEXITCODE\n\n" +
            "  if ($validExitCodes -notcontains $exitCode) {\n" +
            "    throw \"Error with package installation. See above.\"\n" +
            "  }\n" +
            "}\n\n" 
        )

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageVersion = getStorage[1];
            storageValue = getStorage[3];

            // Command Generic One
            commandGenericOne.append(
                "choco upgrade " + storageValue + " -y --source=\"'" + internalRepoUrl + "'\" [other options]\n"
            )

            // Command Generic Two
            commandGenericTwo.append(
                "Install-Package '" + storageValue + "' -Source " + internalRepoUrl + "\n"
            )

            // Command Ansible
            commandAnsible.append(
                "- name: Ensure " + storageValue + " installed\n" +
                "  win_chocolatey:\n" +
                "    name: " + storageValue + "\n" +
                "    state: present\n" +
                "    version: " + storageVersion + "\n" +
                "    source: " + internalRepoUrl + "\n\n"
            )

            // Command Chef
            commandChef.append(
                "chocolatey_package '" + storageValue + "' do\n" +
                "  action    :install\n" +
                "  version   '" + storageVersion + "'\n" +
                "  source    '" + internalRepoUrl + "'\n" +
                "end\n\n"
            )

            // Command Otter
            commandOtter.append(
                "Chocolatey::Ensure-Package\n" +
                "(\n" +
                "    Name: " + storageValue + "\n" +
                "    Version: " + storageVersion + "\n" +
                "    Source: " + internalRepoUrl + "\n" +
                ");\n\n"
            )

            // Command PS DSC
            commandPSDSC.append(
                "cChocoPackageInstaller " + storageValue + "{\n" +
                "   Name    = '" + storageValue + "'\n" +
                "   Ensure  = 'Present'\n" +
                "   Version = '" + storageVersion + "'\n" +
                "   Source  = '" + internalRepoUrl + "'\n" +
                "}\n\n"
            )

            // Command Puppet
            commandPuppet.append(
                "package { '" + storageValue + "':\n" +
                "  provider => '" + storageValue + "',\n" +
                "  ensure   => '" + storageVersion + "',\n" +
                "  source   => '" + internalRepoUrl + "',\n" +
                "}\n\n"
            )

            // Command Salt
            commandSalt.append(
                "salt '*' chocolatey.install " + storageValue + " version=\"" + storageVersion + "\" source=\"" + internalRepoUrl + "\"\n"
            )
        }

        // Highlight Command Generic One
        commandGenericOne.addClass('language-powershell');
        Prism.highlightElement(commandGenericOne[0]);

        // Highlight Command Generic Two
        commandGenericTwo.addClass('language-powershell');
        Prism.highlightElement(commandGenericTwo[0]);

        // Highlight Command Ansible
        commandAnsible.addClass('language-yaml');
        Prism.highlightElement(commandAnsible[0]);

        // Highlight Command Chef
        commandChef.addClass('language-ruby');
        Prism.highlightElement(commandChef[0]);

        // Highlight Command Otter
        commandOtter.addClass('language-powershell');
        Prism.highlightElement(commandOtter[0]);

        // Highlight Command PS DSC
        commandPSDSC.addClass('language-powershell');
        Prism.highlightElement(commandPSDSC[0]);

        // Highlight Command Puppet
        commandPuppet.addClass('language-puppet');
        Prism.highlightElement(commandPuppet[0]);

        // Highlight Command Salt
        commandSalt.addClass('language-python');
        Prism.highlightElement(commandSalt[0]);
    }

    function builderIndividualScript() {
        var commandIndividual = jQuery('.command-builder-individual');

        for (var i in packages) {
            getStorage = packages[i].split(" , ");
            storageValue = getStorage[3];

            // Command Individual
            commandIndividual.append('choco install ' + storageValue + ' -y\n');
        }

        // Highlight Command Individual
        commandIndividual.addClass('language-poweshell');
        Prism.highlightElement(commandIndividual[0]);
    }

    // Storage
    function removeStorage() {
        if (packages.length < 1) {
            localStorage.removeItem('packageList');
            builderStorage.empty();
            jQuery('#addToBuilder').collapse('hide');
            builderViewBtn.addClass('d-none');
            builderModal.modal('hide');
            removeBuilderInputError();
        }
    }

    // Count items
    function countPackages() {
        builderViewBtn.find('.notification-badge').empty(); // First delete value there
        if (packages.length > 0) {
            builderViewBtn.removeClass('d-none').find('.notification-badge').append(JSON.parse(localStorage.packageList).length); // Add in new value
        }
    }

    // Button click inside of builder list
    function removePackages() {
        jQuery('.btn-builder-remove').click(function () {
            packageTitle = jQuery(this).attr('title'),
            packageValue = jQuery(this).attr('value'),
            packageIdentity = packageTitle.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''),
            packageVersion = jQuery(this).attr('version'),
            packageImage = jQuery(this).attr('image');


            // Delete & Update Title & Version from Storage
            for (var i in packages) {
                if (packages[i] == packageTitle + " , " + packageVersion + " , " + packageImage + " , " + packageValue) {
                    packages.splice(i, 1);
                }
            }
            localStorage.packageList = JSON.stringify(packages);

            //Change button state back to green on main page
            jQuery(this).parentsUntil('body').parent().find(".btn-danger." + packageIdentity).each(function () {
                if (jQuery(this).hasClass('btn-builder-text')) {
                    jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span> Add to Script Builder');
                } else {
                    jQuery(this).html('<span class="fas fa-plus-circle" alt="Add to Script Builder"></span>');
                }
            });
            jQuery(this).parentsUntil('body').parent().find(".btn-danger." + packageIdentity).removeClass('btn-danger').addClass('btn-success').removeClass(packageIdentity);

            // Remove from builder list
            jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).prev().remove();
            jQuery(this).parentsUntil('body').parent().find('.storage').find(jQuery('.' + packageIdentity)).remove();

            // Storage
            removeStorage();

            // Count items
            countPackages();
        });
    }

    // Download xml file
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Beautify xml document
    function formatXml(text) {
        var filename = "packages.config"
        formatted = '', indent = '',
            tab = '\t';

        text.split(/>\s*</).forEach(function (node) {
            if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // decrease indent by one 'tab'
            formatted += indent + '<' + node + '>\r\n';
            if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;              // increase indent
        });
        text = formatted.substring(1, formatted.length - 3);

        // Send to download
        download(filename, text);
    }

    builderModal.on('shown.bs.modal', function () {
        builderScriptType();
        builderTabs();
        builderNavButtons();

        builderModal.find('.nav-tabs-install a[data-bs-toggle="tab"]').on('shown.bs.tab', function () {
            builderScriptType();
            builderTabs();
        });

        builderScriptInput.keyup(function () {
            builderTabs();
            builderNavButtons();
        }).keyup();

        builderModal.find('.nav-item.disabled').click(function () {
            builderInputError();
            builderNavButtons();
        });

        builderModal.find('#builder-steps a[data-bs-toggle="pill"]').on('shown.bs.tab', function () {
            builderNavButtons();
        });
    });

    builderNextBtn.click(function () {
        builderNextStep = jQuery('#builder-steps').find('.active').parent().next('li').find('a');

        if (builderNextStep.hasClass('disabled') && builderOrganization.hasClass('active')) {
            builderInputError();
        } else if (!builderStep3.hasClass('active') || !builderIndividual.hasClass('active')) {
            builderNextStep.tab('show');
        }

        builderNavButtons();
    });

    builderPrevBtn.click(function () {
        builderPrevStep = jQuery('#builder-steps').find('.active').parent().prev('li').find('a');

        builderPrevStep.tab('show');
        builderNavButtons();
    });

    function builderNavButtons() {
        builderNextStep = jQuery('#builder-steps').find('.active').parent().next('li').find('a');
        builderPrevStep = jQuery('#builder-steps').find('.active').parent().prev('li').find('a');

        // Next Button
        if (builderNextStep.hasClass('disabled') || builderStep5.children().hasClass('active') || builderStep3.hasClass('active') && builderIndividual.hasClass('active')) {
            builderNextBtn.addClass('disabled');
        } else {
            builderNextBtn.removeClass('disabled');
        }

        // Prev Button
        if (builderStep1.hasClass('active')) {
            builderPrevBtn.addClass('disabled');
        } else {
            builderPrevBtn.removeClass('disabled');
        }
    }

    function builderScriptType() {
        if (jQuery('#builder-individual-tab').hasClass('active')) {
            builderStep3.html('<strong><span class="d-none d-sm-inline-block me-1">STEP</span><span>3</span></strong><p class="mb-0 d-none d-lg-block">Install Script / Config</p>').removeClass('error');
            builderStep4.add(builderStep5).add(builderOrganization).addClass('d-none').children();
            builderIndividual.removeClass('d-none').addClass('active');
            builderOrganization.removeClass('active');
        } else {
            builderStep3.html('<strong><span class="d-none d-sm-inline-block me-1">STEP</span><span>3</span></strong><p class="mb-0 d-none d-lg-block">Internal Repo Url</p>');
            builderStep4.add(builderStep5).add(builderOrganization).removeClass('d-none').children();
            builderIndividual.addClass('d-none').removeClass('active');
            builderOrganization.addClass('active');
        }
    }

    function appendPackage(packageTitle, packageValue, packageIdentity, packageVersion, packageUrl, packageImage, packageImagePath) {
        builderStorage.append(
            '<div id="' + packageIdentity + '" class="d-flex flex-row align-items-start storage-row ' + packageIdentity + '">' +
            '<div class="ratio ratio-1x1 package-image-header">' +
            '<div class="d-flex flex-fill align-items-center justify-content-center package-icon">' +
            '<img class="package-image" src="' + packageImagePath + '' + packageImage + '" height="30" width="30">' + 
            '</div>' +
            '</div>' +
            '<div class="mx-2">' + 
            '<a class="text-reset btn-link mb-0 h5 text-break" href="/packages/' + packageUrl + '/' + packageVersion + '">' + packageTitle + '</a>' + 
            '<p class="mb-0"><small>' + packageVersion + '</small></p>' + 
            '</div>' +
            '<button class="btn btn-sm btn-builder-remove btn-danger ms-auto" value="' + packageValue + '" title="' + packageTitle + '" version="' + packageVersion + '" image="' + packageImage + '"><span class="fas fa-minus-circle"></span></button>' + 
            '</div>'
        );

        jQuery('<hr />').insertBefore('.storage #' + packageIdentity + '');
    }

    function builderTabs() {
        if (builderScriptInput.val() == 0) {
            builderStep4.add(builderStep5).addClass('disabled').children().addClass('disabled');
        } else {
            removeBuilderInputError();
        }
    }

    function builderInputError() {
        if (builderScriptInput.val() == 0) {
            builderStep3.addClass('error');
            builderStep3.tab('show');
            if (!builderScriptInput.hasClass('is-invalid')) {
                builderModal.find(builderScriptInput).addClass('is-invalid');
                jQuery('<div class="invalid-feedback">You must enter your internal repository url to continue.</div>').insertAfter(builderModal.find(builderScriptInput));
            }
        }
    }

    function removeBuilderInputError() {
        builderStep4.add(builderStep5).removeClass('disabled').children().removeClass('disabled');
        builderStep3.removeClass('error');
        builderModal.find(builderScriptInput).removeClass('is-invalid');
        builderModal.find('.invalid-feedback').remove();
    }
});
})();