import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAll, fetchDetails, install, uninstall } from './actions';
import { CatalogPlugin } from '../types';
import {
  selectAll,
  selectById,
  selectIsRequestPending,
  selectRequestError,
  selectIsRequestNotFetched,
} from './selectors';

export const useGetAll = (): CatalogPlugin[] => {
  useFetchAll();

  return useSelector(selectAll);
};

export const useGetSingle = (id: string): CatalogPlugin | undefined => {
  useFetchAll();
  useFetchDetails(id);

  return useSelector((state) => selectById(state, id));
};

export const useInstall = () => {
  const dispatch = useDispatch();

  return (id: string, version: string, isUpdating?: boolean) => dispatch(install({ id, version, isUpdating }));
};

export const useUninstall = () => {
  const dispatch = useDispatch();

  return (id: string) => dispatch(uninstall(id));
};

export const useFetchStatus = () => {
  const isLoading = useSelector(selectIsRequestPending(fetchAll.typePrefix));
  const error = useSelector(selectRequestError(fetchAll.typePrefix));

  return { isLoading, error };
};

export const useInstallStatus = () => {
  const isInstalling = useSelector(selectIsRequestPending(install.typePrefix));
  const error = useSelector(selectRequestError(install.typePrefix));

  return { isInstalling, error };
};

export const useUninstallStatus = () => {
  const isUninstalling = useSelector(selectIsRequestPending(uninstall.typePrefix));
  const error = useSelector(selectRequestError(uninstall.typePrefix));

  return { isUninstalling, error };
};

// Only fetches in case they were not fetched yet
export const useFetchAll = () => {
  const dispatch = useDispatch();
  const isNotFetched = useSelector(selectIsRequestNotFetched(fetchAll.typePrefix));

  useEffect(() => {
    isNotFetched && dispatch(fetchAll());
  }, []); // eslint-disable-line
};

export const useFetchDetails = (id: string) => {
  const dispatch = useDispatch();
  const plugin = useSelector((state) => selectById(state, id));
  const isPending = useSelector(selectIsRequestPending(fetchDetails.typePrefix));
  const shouldFetch = !isPending && !plugin?.details;

  useEffect(() => {
    shouldFetch && dispatch(fetchDetails(id));
  }, []); // eslint-disable-line
};
