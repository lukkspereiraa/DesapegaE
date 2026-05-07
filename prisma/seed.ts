import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcryptjs";
import { PrismaClient, RoleName, UserStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is required to run seed.');
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
	adapter,
});

const roleNames: RoleName[] = [RoleName.Admin, RoleName.Advertiser, RoleName.Guest];

const defaultCategories = ["Tecnologia", "Roupas", "Moveis", "Eletronicos"];

type AdminEnv = {
	email: string;
	password: string;
	name: string;
	phone: string;
	stateCode: string;
	stateName: string;
	cityName: string;
	neighborhood: string;
	postalCode: string;
	street: string;
	number: string;
	complement: string;
	avatarUrl?: string;
};

function getRequiredEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function getAdminEnv(): AdminEnv {
	return {
		email: getRequiredEnv("SEED_ADMIN_EMAIL"),
		password: getRequiredEnv("SEED_ADMIN_PASSWORD"),
		name: process.env.SEED_ADMIN_NAME?.trim() || "Administrador",
		phone: process.env.SEED_ADMIN_PHONE?.trim() || "(00) 90000-0000",
		stateCode: process.env.SEED_ADMIN_STATE_CODE?.trim() || "CE",
		stateName: process.env.SEED_ADMIN_STATE_NAME?.trim() || "Ceara",
		cityName: process.env.SEED_ADMIN_CITY_NAME?.trim() || "Cedro",
		neighborhood: process.env.SEED_ADMIN_NEIGHBORHOOD?.trim() || "Centro",
		postalCode: process.env.SEED_ADMIN_POSTAL_CODE?.trim() || "63400-000",
		street: process.env.SEED_ADMIN_STREET?.trim() || "Rua Principal",
		number: process.env.SEED_ADMIN_NUMBER?.trim() || "100",
		complement: process.env.SEED_ADMIN_COMPLEMENT?.trim() || "Sala Admin",
		avatarUrl: process.env.SEED_ADMIN_AVATAR_URL?.trim() || undefined,
	};
}

async function seedRoles() {
	for (const name of roleNames) {
		await prisma.role.upsert({
			where: { name },
			create: { name },
			update: {},
		});
	}
}

async function seedCategories() {
	for (const name of defaultCategories) {
		await prisma.category.upsert({
			where: { name },
			create: { name },
			update: {},
		});
	}
}

async function upsertAdmin(adminEnv: AdminEnv) {
	const adminRole = await prisma.role.findUnique({
		where: { name: RoleName.Admin },
		select: { id: true },
	});

	if (!adminRole) {
		throw new Error("Admin role not found during seed");
	}

	const state = await prisma.state.upsert({
		where: { code: adminEnv.stateCode },
		create: {
			code: adminEnv.stateCode,
			name: adminEnv.stateName,
		},
		update: {
			name: adminEnv.stateName,
		},
	});

	const city = await prisma.city.upsert({
		where: {
			name_stateId: {
				name: adminEnv.cityName,
				stateId: state.id,
			},
		},
		create: {
			name: adminEnv.cityName,
			stateId: state.id,
		},
		update: {},
	});

	const existingAddress = await prisma.address.findFirst({
		where: {
			cityId: city.id,
			neighborhood: adminEnv.neighborhood,
			postalCode: adminEnv.postalCode,
			street: adminEnv.street,
			number: adminEnv.number,
			complement: adminEnv.complement,
		},
		select: { id: true },
	});

	const address =
		existingAddress ??
		(await prisma.address.create({
			data: {
				cityId: city.id,
				neighborhood: adminEnv.neighborhood,
				postalCode: adminEnv.postalCode,
				street: adminEnv.street,
				number: adminEnv.number,
				complement: adminEnv.complement,
			},
			select: { id: true },
		}));

	const passwordHash = await bcrypt.hash(adminEnv.password, 12);

	await prisma.user.upsert({
		where: { email: adminEnv.email },
		create: {
			name: adminEnv.name,
			email: adminEnv.email,
			password: passwordHash,
			phone: adminEnv.phone,
			avatarUrl: adminEnv.avatarUrl,
			status: UserStatus.Active,
			roleId: adminRole.id,
			addressId: address.id,
		},
		update: {
			name: adminEnv.name,
			password: passwordHash,
			phone: adminEnv.phone,
			avatarUrl: adminEnv.avatarUrl,
			status: UserStatus.Active,
			roleId: adminRole.id,
			addressId: address.id,
		},
	});
}

async function main() {
	const adminEnv = getAdminEnv();

	await seedRoles();
	await seedCategories();
	await upsertAdmin(adminEnv);

	const [rolesCount, categoriesCount, usersCount] = await Promise.all([
		prisma.role.count(),
		prisma.category.count(),
		prisma.user.count(),
	]);

	console.log(`Seed complete: ${rolesCount} roles, ${categoriesCount} categories, ${usersCount} users`);
}

main()
	.catch((error) => {
		console.error("Seed failed", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
