import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {Controller, Patch, Param, ParseIntPipe, Get, UseInterceptors, Delete} from "@nestjs/common";
import {
  Crud, CrudController, Feature,
  ParsedRequest, CrudRequest, CrudRequestInterceptor, Override, ParsedBody
} from "@nestjsx/crud";
import {Customer, User} from "src/common/entity";
import {CustomerService} from "./index.service";
import {CurrentUser} from "src/common/decorators";
import {GrantAccess} from "src/common/decorators";
import {ECrudAction, ECrudFeature} from "src/common/enums";
import {SqlInterceptor} from "src/common/interceptors/sql.interceptor";

/**
 * TODO: Get me customer
 * soft delete and restore auth
 * update profile customer
 * register customer in auth
 */

@Crud({
  model: {
    type: Customer
  },
  routes: {
    exclude: ["createOneBase", "createManyBase", "replaceOneBase"],
    deleteOneBase: {
      decorators: [
        GrantAccess({
          type: "CUSTOMER",
          action: ECrudAction.DELETE
        })
      ]
    }
  }
})
@ApiTags("Customers")
@Feature(ECrudFeature.CUSTOMER)
@Controller("customers")
export class CustomerController implements CrudController<Customer> {
  constructor(public service: CustomerService) {}

  get base(): CrudController<Customer> {
    return this;
  }

  @UseInterceptors(SqlInterceptor)
  @GrantAccess({
    action: ECrudAction.UPDATE
  })
  @Override("updateOneBase")
  async updateOneOverride(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Customer,
    @CurrentUser() user: Customer
  ): Promise<Customer> {
    const userId: number = req.parsed.paramsFilter[0].value;
    await this.service.mapRelationKeysToEntities(dto);
    this.service.validateAuthor(userId, user);
    return this.base.updateOneBase(req, dto);
  };

  @ApiOperation({
    description: "Restore one record"
  })
  @Patch(":id/restore")
  @GrantAccess({
    action: ECrudAction.RESTORE
  })
  restoreCustomer(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: Customer
  ) {
    this.service.validateAuthor(id, user);
    return this.service.restore(id);
  }

  @ApiOperation({
    summary: "Get trashed records with crud fitler"
  })
  @UseInterceptors(CrudRequestInterceptor)
  @Get("trashed")
  @GrantAccess({
    action: ECrudAction.READ
  })
  getDeleted(@ParsedRequest() req: CrudRequest) {
    return this.service.getDeleted(req);
  }

  @ApiOperation({
    summary: "Soft delete one record"
  })
  @Override("deleteOneBase")
  @GrantAccess({
    action: ECrudAction.SOFT_DEL
  })
  softDelete(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: Customer
  ) {
    this.service.validateAuthor(id, currentUser);
    return this.service.softDelete(id);
  }

  @ApiOperation({
    summary: "Permanently delete one record"
  })
  @Delete(":id/permanently")
  @GrantAccess({
    action: ECrudAction.DELETE
  })
  hardDelete(
    @ParsedRequest() req: CrudRequest,
    @CurrentUser() user: Customer
  ) {
    const userId: number = req.parsed.paramsFilter[0].value;
    this.service.validateAuthor(userId, user);
    return this.base.deleteOneBase(req);
  }
}
