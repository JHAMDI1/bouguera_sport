import { ReactNode } from "react";

export interface Column<T> {
    header: string;
    accessor: (row: T) => ReactNode;
    className?: string; // pour l'alignement, ex: "text-right"
}

interface DataTableProps<T> {
    data: T[] | undefined;
    columns: Column<T>[];
    keyExtractor: (row: T) => string;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    isLoading,
    emptyMessage = "Aucun résultat trouvé"
}: DataTableProps<T>) {
    return (
        <div className="w-full">
            {/* Vue Desktop: Table standard */}
            <div className="hidden md:block table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} className={col.className}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((row) => (
                            <tr key={keyExtractor(row)} className="hover:bg-background-tertiary transition-colors">
                                {columns.map((col, i) => (
                                    <td key={i} className={col.className}>{col.accessor(row)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vue Mobile: Liste de cartes */}
            <div className="md:hidden space-y-4">
                {data?.map((row) => (
                    <div key={keyExtractor(row)} className="card p-4 space-y-3">
                        {columns.map((col, i) => {
                            // On ne rend la valeur que si elle n'est pas nulle/vide, sauf si on veut toujours voir le titre de la colonne.
                            const value = col.accessor(row);
                            if (value === null || value === undefined) return null;

                            return (
                                <div key={i} className={`flex flex-col ${col.className?.includes('right') ? 'items-start' : ''}`}>
                                    <span className="text-xs text-foreground-secondary mb-1 uppercase tracking-wider font-bold">
                                        {col.header}
                                    </span>
                                    <div>{value}</div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* États de chargement et liste vide */}
            {isLoading && !data && (
                <div className="text-center py-8 text-foreground-secondary">Chargement...</div>
            )}
            {!isLoading && data?.length === 0 && (
                <div className="text-center py-8 text-foreground-secondary">{emptyMessage}</div>
            )}
        </div>
    );
}
