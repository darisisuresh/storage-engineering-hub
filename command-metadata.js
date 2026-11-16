const sources = {
 netapp:['NetApp ONTAP','https://docs.netapp.com/us-en/ontap-cli/'],
 powermax:['Dell PowerMax / Solutions Enabler','https://www.dell.com/support/manuals/en-us/solutions-enabler/'],
 cisco:['Cisco MDS / NX-OS (9.x reference)','https://www.cisco.com/c/en/us/td/docs/dcn/mds9000/sw/9x/command/cisco-mds-9000-nx-os-command-reference-guide-9x/show_commands.html'],
 brocade:['Brocade Fabric OS (8.2.x reference)','https://docs.broadcom.com/doc/FOS-82x-Command-RM'],
 pure:['Pure FlashArray / Purity CLI','https://support.everpuredata.com/'],
 hpe:['HPE family-specific CLI','https://support.hpe.com/']
};
export function withCommandMetadata(c) {
 const [product,url]=sources[c.vendor]||[];
 if(!product) throw new Error('Unknown command vendor');
 return {...c, product:c.platform ? `${product}: ${c.category}` : product,
 minimumTestedRelease:null, testedReleases:[], requiredPrivileges:null,
 operationalRisk:c.effect||'Read-only', officialDocumentationUrl:c.source||url,
 validationStatus:'not-lab-verified', documentationReviewedAt:null, lastValidated:null};
}
export function releaseStatus(c,release='') {
 const target=release.trim();
 return target ? `Unverified for selected release: ${target}` : 'Unverified — select and independently verify your installed release';
}
export function commandMetadata(c,escape,release='') {
 return `<div class="command-metadata"><p class="small-text"><strong>${escape(releaseStatus(c,release))}</strong></p><details><summary>Release, privileges &amp; source</summary><dl><dt>Product / reference scope</dt><dd>${escape(c.product)}</dd><dt>Operational risk</dt><dd>${escape(c.operationalRisk)}</dd><dt>Required privileges</dt><dd>Not independently verified. Confirm the command and role in your installed release’s RBAC documentation.</dd><dt>Minimum tested release</dt><dd>None recorded — no equipment lab validation</dd><dt>Last documentation review / validation</dt><dd>Not recorded / not lab verified</dd></dl><a href="${escape(c.officialDocumentationUrl)}" target="_blank" rel="noopener noreferrer">Official vendor reference ↗</a><p class="small-text">Reference scope is not a compatibility guarantee. Confirm syntax, options, privileges and impact against the exact installed release before use. A read-only command can expose sensitive information or incur load.</p></details></div>`;
}
