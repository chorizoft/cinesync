<script lang="ts">
  import {
    faPlusCircle,
    faLock,
    faLockOpen,
    faShareNodes,
    faClone
  } from '@fortawesome/free-solid-svg-icons';
  import SubmitButton from '$lib/SubmitButton.svelte';
  import Delete from './Delete.svelte';
  import MovieModal from '$lib/Movie/MovieModal.svelte';
  import IconButton from '$lib/IconButton.svelte';
  import Avatar from '$lib/Avatar.svelte';
  import ListShareModal from './ListShareModal.svelte';
  import UserModal from './UserModal.svelte';
  import type { ListType, User } from '../../ambient';

  export let list: ListType;
  export let user: User;

  let showMovieModal = false;
  let showShareListModal = false;
  let showUserModal = false;
  let selectedSharee = '';
</script>

<div class="flex justify-between mx-1">
  <div class="flex gap-x-4">
    {#if list.creatorUsername === user.username}
      <Avatar username="{list.creatorUsername}" />
    {/if}
    <div class="text-lg font-black">{list.name}</div>
    <IconButton
      type="button"
      classes="min-h-full"
      icon="{faPlusCircle}"
      tooltip="add movie"
      on:click="{() => (showMovieModal = true)}"
    />
    {#if list?.creatorId === user.id}
      <Delete listId="{list.id}" />
      <SubmitButton
        formAction="lists?/togglePrivacy"
        inputs="{[
          { name: 'listId', value: list.id },
          { name: 'isPrivate', value: list.isPrivate ? 'true' : 'false' }
        ]}"
        icon="{list.isPrivate ? faLock : faLockOpen}"
        tooltip="{list.isPrivate ? 'private list' : 'public list'}"
      />
    {:else}
      <SubmitButton
        formAction="lists?/cloneList"
        inputs="{[
          { name: 'listId', value: list.id },
          { name: 'name', value: list.name }
        ]}"
        icon="{faClone}"
        tooltip="clone list"
      />
    {/if}
    <IconButton
      type="button"
      classes="min-h-full"
      icon="{faShareNodes}"
      tooltip="share list"
      on:click="{() => (showShareListModal = true)}"
    />
  </div>
  <div class="flex gap-x-4">
    {#if list?.sharees?.length}
      {#each list.sharees as sharee (sharee.email)}
        <button
          on:click="{() => {
            selectedSharee = sharee.username;
            showUserModal = true;
          }}"
        >
          <Avatar username="{sharee.username}" />
        </button>
      {/each}
    {/if}
  </div>
</div>

<ListShareModal bind:showShareListModal="{showShareListModal}" listId="{list.id}" />
<MovieModal bind:showMovieModal="{showMovieModal}" listId="{list.id}" />
<UserModal
  bind:showModal="{showUserModal}"
  sharee="{selectedSharee}"
  movies="{list.movie}"
  sharees="{list.sharees}"
/>
