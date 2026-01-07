
<script>
	import 'iconify-icon'

	let isOpen = false

</script> 


<!-- P Navigation Toggle -->
<!-- <button 
  type="button" 
  class="text-gray-500 hover:text-blue-600 h-auto inline-flex items-center justify-center p-0 m-2" 
  data-hs-overlay="#docs-sidebar"
  aria-controls="docs-sidebar"
  aria-label="Toggle navigation"
  on:click={() => isOpen = !isOpen}
>
  <span class="sr-only">Toggle Navigation</span>
  <iconify-icon icon="material-symbols-light:menu" height={36}></iconify-icon>
</button> -->
<!-- P End Navigation Toggle -->


<!-- P Sidebar -->
<div id="docs-sidebar" class="hs-overlay [--auto-close:lg] transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
	<div class="px-6">
		<a class="flex-none text-xl font-semibold" href="/admin" aria-label="Brand">YAPP Admin Center</a>
	</div>

	<nav class="hs-accordion-group p-6 w-full flex flex-col flex-wrap" data-hs-accordion-always-open>
		<ul class="space-y-1.5">

			<!-- Dashboard -->
			<li> 
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin">
					<iconify-icon icon="material-symbols-light:home-outline-rounded" height={24}></iconify-icon>
					Dashboard
				</a>
			</li>

			<!-- Admin Account -->
			<li class="hs-accordion" id="account-accordion">
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/adminaccount">
					<iconify-icon icon="material-symbols-light:account-circle-outline" height={24}></iconify-icon>
					<p>Admin Account</p>
				</a>
			</li>

			<!-- Settings -->
			<li class="hs-accordion" id="account-accordion">
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/settings">
					<iconify-icon icon="material-symbols-light:settings-outline-rounded" height={24}></iconify-icon>
					<p>Settings</p>
				</a>
			</li>

			<!-- Users -->
			<li class="hs-accordion" id="account-accordion">
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/users">
					<iconify-icon icon="material-symbols-light:manage-accounts-outline-rounded" height={24}></iconify-icon>
					<p>Users</p>
				</a>
			</li>

			<!-- Security -->
			<li>
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/security">
					<iconify-icon icon="material-symbols-light:security-rounded" height={24}></iconify-icon>
					<p>Security</p>
				</a>
			</li>

			<!-- Integrations -->
			<li>
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/integrations">
					<iconify-icon icon="material-symbols-light:integration-instructions-outline-rounded" height={24}></iconify-icon>
					<p>Integrations</p>
				</a>
			</li>

			<!-- Blog -->
			<li>
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/blog">
					<iconify-icon icon="material-symbols-light:assignment-add-outline-rounded" height={24}></iconify-icon>
					<p>Blog</p>
				</a>
			</li>

			
			<!-- Wiki -->
			<!-- <li>
				<a class="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/admin/wiki">
					<iconify-icon icon="material-symbols-light:dictionary-outline-rounded" height={24}></iconify-icon>
					<p>Wiki</p>
				</a>
			</li> -->

			<li>
				<a class="flex items-center gap-x-3.5 py-8 px-2.5 bg-gray-100 text-sm text-gray-700 rounded-lg hover:bg-gray-100" href="/">
					<iconify-icon icon="material-symbols-light:arrow-left-alt-rounded" height={24}></iconify-icon>
					<p>Home</p>
				</a>
			</li>





		</ul>
	</nav>
</div>
<!-- P End Sidebar -->

