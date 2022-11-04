import { BackendService } from "../backend/backend.service";
import { BackendServiceStub } from "../backend/backend.stub";
import { CatalogueEntryStatus, PaginatedRecord, RawCatalogueEntryFilter } from "../backend/backend.api";
import { CatalogueEntry, CatalogueEntryFilter } from "./catalogueEntryProvider.api";
import { StatusProvider } from "./statusProvider";
import { UserProvider } from "./userProvider";
import { UserFilter } from "./userProvider.api";

export class CatalogueEntryProvider {
  // Get the backend stub if the test flag is used.
  private backend: BackendService = import.meta.env.MODE === "mock" ? new BackendServiceStub() : new BackendService();
  private statusProvider = new StatusProvider();
  private userProvider = new UserProvider();

  public async fetchCatalogueEntries (catalogueEntryFilter: CatalogueEntryFilter):
      Promise<PaginatedRecord<CatalogueEntry>>{
    const { custodian, status, assignedTo, updateFrom, updateTo } = Object.fromEntries(catalogueEntryFilter.entries());

    const rawFilter = {
      custodian,
      status,
      assigned_to: assignedTo,
      updated_before: updateTo,
      updated_after: updateFrom
    } as RawCatalogueEntryFilter;

    const { previous, next, count, results } = await this.backend.getCatalogueEntries(rawFilter);
    const entryStatuses = await this.statusProvider.fetchStatuses<CatalogueEntryStatus>("entries");

    const userFields: Record<string, number | null>[] = results
      .map(({ custodian, assigned_to }) => ({ custodian, assigned_to }));
    const userIds = UserProvider.getUniqueUserIds(userFields);
    const users = await this.userProvider.fetchUsers({ ids: userIds } as UserFilter);

    const catalogueEntries = results.map(entry => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      status: this.statusProvider.getRecordStatusFromId(entry.status, entryStatuses),
      updatedAt: entry.updated_at,
      custodian: UserProvider.getUserFromId(entry.custodian, users),
      assignedTo: UserProvider.getUserFromId(entry.assigned_to, users),
      subscription: entry.subscription,
      activeLayer: entry.active_layer,
      layers: entry.layers,
      emailNotifications: entry.email_notifications,
      webhookNotifications: entry.webhook_notifications
    })) as Array<CatalogueEntry>;

   return { previous, next, count, results: catalogueEntries } as PaginatedRecord<CatalogueEntry>;
  }

}
