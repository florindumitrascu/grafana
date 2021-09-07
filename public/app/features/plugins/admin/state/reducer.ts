import { createSlice, createEntityAdapter, EntityState, AnyAction } from '@reduxjs/toolkit';
import { PluginsState } from 'app/types';
import { fetchAll, fetchDetails, install, uninstall, loadPanelPlugin, loadPluginDashboards } from './actions';
import { CatalogPlugin, RequestInfo, RequestStatus } from '../types';
import { STATE_PREFIX } from '../constants';

type ReducerState = PluginsState & {
  items: EntityState<CatalogPlugin>;
  requests: Record<string, RequestInfo>;
};

export const pluginsAdapter = createEntityAdapter<CatalogPlugin>();

const isPendingRequest = (action: AnyAction) => new RegExp(`${STATE_PREFIX}\/(.*)\/pending`).test(action.type);

const isFulfilledRequest = (action: AnyAction) => new RegExp(`${STATE_PREFIX}\/(.*)\/fulfilled`).test(action.type);

const isRejectedRequest = (action: AnyAction) => new RegExp(`${STATE_PREFIX}\/(.*)\/rejected`).test(action.type);

// Extract the trailing '/pending', '/rejected', or '/fulfilled'
const getOriginalActionType = (type: string) => {
  const separator = type.lastIndexOf('/');

  return type.substring(0, separator);
};

export const { reducer } = createSlice({
  name: 'plugins',
  initialState: {
    items: pluginsAdapter.getInitialState(),
    requests: {},
    // Backwards compatibility
    // (we need to have these in the store as well until other parts of the app are changed)
    plugins: [],
    errors: [],
    searchQuery: '',
    hasFetched: false,
    dashboards: [],
    isLoadingPluginDashboards: false,
    panels: {},
  } as ReducerState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      // Fetch All
      .addCase(fetchAll.fulfilled, (state, action) => {
        pluginsAdapter.upsertMany(state.items, action.payload);
      })
      // Fetch Details
      .addCase(fetchDetails.fulfilled, (state, action) => {
        pluginsAdapter.updateOne(state.items, action.payload);
      })
      // Install
      .addCase(install.fulfilled, (state, action) => {
        pluginsAdapter.updateOne(state.items, action.payload);
      })
      // Uninstall
      .addCase(uninstall.fulfilled, (state, action) => {
        pluginsAdapter.updateOne(state.items, action.payload);
      })
      .addCase(loadPanelPlugin.fulfilled, (state, action) => {
        state.panels[action.payload.meta!.id] = action.payload;
      })
      .addCase(loadPluginDashboards.pending, (state, action) => {
        state.isLoadingPluginDashboards = true;
        state.dashboards = [];
      })
      .addCase(loadPluginDashboards.fulfilled, (state, action) => {
        state.isLoadingPluginDashboards = false;
        state.dashboards = action.payload;
      })
      .addMatcher(isPendingRequest, (state, action) => {
        state.requests[getOriginalActionType(action.type)] = {
          status: RequestStatus.Pending,
        };
      })
      .addMatcher(isFulfilledRequest, (state, action) => {
        state.requests[getOriginalActionType(action.type)] = {
          status: RequestStatus.Fulfilled,
        };
      })
      .addMatcher(isRejectedRequest, (state, action) => {
        state.requests[getOriginalActionType(action.type)] = {
          status: RequestStatus.Rejected,
          error: action.payload,
        };
      }),
});
