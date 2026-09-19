export type Categoria = {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoriaFormData = {
  nombre: string;
  descripcion: string;
  activo: boolean;
};

export type CategoriaFormErrors = {
  nombre?: string;
  descripcion?: string;
};
