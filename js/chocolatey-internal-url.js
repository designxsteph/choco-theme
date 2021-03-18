(function() {
    jQuery(function () {
        var
        deploymentMethodCookie = getCookie('deployment_method'),
        individualMethodTab = jQuery('#individual-method-tab'),
        organizationMethodTab = jQuery('#organization-method-tab'),
        builderScriptInput = jQuery('.internalRepoUrlInput'),
        defaultUrl = "http://internal/odata/repo",
        deploymentMethodHash = window.location.hash.toString().toLowerCase(),
        deploymentMethodHashArray = [];

        jQuery('[data-deployment-method]').each(function () {
            if (!deploymentMethodHashArray.includes(jQuery(this).attr('href'))) {
                deploymentMethodHashArray.push(jQuery(this).attr('href'));
            }
        });

        if (deploymentMethodHashArray.includes(deploymentMethodHash)) {
            var deploymentMethod = jQuery('[href="' + deploymentMethodHash + '"]').attr('data-deployment-method');
            document.cookie = "deployment_method=" + deploymentMethod + "; path=/";

            jQuery('[data-deployment-method="' + deploymentMethod + '"]').tab('show');

            if (deploymentMethodHash.includes("individual")) {
                individualMethodTab.tab('show');
            } else {
                organizationMethodTab.tab('show');
            }
        } else if (deploymentMethodCookie) {
            jQuery('[data-deployment-method="' + deploymentMethodCookie + '"]').tab('show');

            if (deploymentMethodCookie == "Individual") {
                individualMethodTab.tab('show');
            } else {
                organizationMethodTab.tab('show');
            }
        }

        jQuery('.copy-command .toolbar a').each(function () {
            var copyCommand = jQuery(this).parentsUntil('.code-toolbar').parent().find('code').attr('class').split(" ");
            jQuery(this).addClass('btn-copy').attr('data-clipboard-target', '.' + copyCommand[0]);
        });
        jQuery("code:contains('INTERNAL REPO URL')").html(function (_, html) {
            return html.replace(/(INTERNAL REPO URL)/g, '<span class="internalRepoUrl">$1</span>');
        });
        builderScriptInput.keyup(function () {
            var value = jQuery(this).val();

            jQuery('.internalRepoUrl').text(value);
            builderScriptInput.val(value);
            if (value == 0) {
                jQuery('.internalRepoUrl').text(defaultUrl);
                if (!jQuery(".contains-internal-repo-url").children().hasClass('internal-repo-url-warning')) {
                    jQuery(".contains-internal-repo-url").prepend('<p class="internal-repo-url-warning callout callout-danger shadow-none text-danger font-weight-bold small">You must enter your internal repository url above before proceeding.</p>');
                }
            }
            else {
                jQuery('.internal-repo-url-warning').fadeOut("slow", function () {
                    jQuery(this).remove();
                });
            }
        }).keyup();

        jQuery('[data-deployment-method]').click(function () {
            var deploymentMethod = jQuery(this).attr('data-deployment-method');

            // Set preferred deployment method to use for showing integration method
            document.cookie = "deployment_method=" + deploymentMethod + "; path=/";

            // When deployment method is changed on package page, also change inside builder modal and vice versa
            jQuery('[data-deployment-method="' + deploymentMethod + '"]').tab('show');

            if (deploymentMethod == "Individual") {
                individualMethodTab.tab('show');
            } else {
                organizationMethodTab.tab('show');
            }
        });
    });
})();