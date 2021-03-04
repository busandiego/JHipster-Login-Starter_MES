/* tslint:disable max-line-length */
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import sinon, { SinonStubbedInstance } from 'sinon';

import AlertService from '@/shared/alert/alert.service';
import * as config from '@/shared/config/config';
import ApplyInviteCardComponent from '@/entities/apply-invite-card/apply-invite-card.vue';
import ApplyInviteCardClass from '@/entities/apply-invite-card/apply-invite-card.component';
import ApplyInviteCardService from '@/entities/apply-invite-card/apply-invite-card.service';

const localVue = createLocalVue();

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
localVue.component('font-awesome-icon', {});
localVue.component('b-alert', {});
localVue.component('b-badge', {});
localVue.directive('b-modal', {});
localVue.component('b-button', {});
localVue.component('router-link', {});

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {}
  }
};

describe('Component Tests', () => {
  describe('ApplyInviteCard Management Component', () => {
    let wrapper: Wrapper<ApplyInviteCardClass>;
    let comp: ApplyInviteCardClass;
    let applyInviteCardServiceStub: SinonStubbedInstance<ApplyInviteCardService>;

    beforeEach(() => {
      applyInviteCardServiceStub = sinon.createStubInstance<ApplyInviteCardService>(ApplyInviteCardService);
      applyInviteCardServiceStub.retrieve.resolves({ headers: {} });

      wrapper = shallowMount<ApplyInviteCardClass>(ApplyInviteCardComponent, {
        store,
        i18n,
        localVue,
        stubs: { jhiItemCount: true, bPagination: true, bModal: bModalStub as any },
        provide: {
          alertService: () => new AlertService(store),
          applyInviteCardService: () => applyInviteCardServiceStub
        }
      });
      comp = wrapper.vm;
    });

    it('should be a Vue instance', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('Should call load all on init', async () => {
      // GIVEN
      applyInviteCardServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

      // WHEN
      comp.retrieveAllApplyInviteCards();
      await comp.$nextTick();

      // THEN
      expect(applyInviteCardServiceStub.retrieve.called).toBeTruthy();
      expect(comp.applyInviteCards[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });

    it('should load a page', async () => {
      // GIVEN
      applyInviteCardServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });
      comp.previousPage = 1;

      // WHEN
      comp.loadPage(2);
      await comp.$nextTick();

      // THEN
      expect(applyInviteCardServiceStub.retrieve.called).toBeTruthy();
      expect(comp.applyInviteCards[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });

    it('should not load a page if the page is the same as the previous page', () => {
      // GIVEN
      applyInviteCardServiceStub.retrieve.reset();
      comp.previousPage = 1;

      // WHEN
      comp.loadPage(1);

      // THEN
      expect(applyInviteCardServiceStub.retrieve.called).toBeFalsy();
    });

    it('should re-initialize the page', async () => {
      // GIVEN
      applyInviteCardServiceStub.retrieve.reset();
      applyInviteCardServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

      // WHEN
      comp.loadPage(2);
      await comp.$nextTick();
      comp.clear();
      await comp.$nextTick();

      // THEN
      expect(applyInviteCardServiceStub.retrieve.callCount).toEqual(3);
      expect(comp.page).toEqual(1);
      expect(comp.applyInviteCards[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });

    it('should calculate the sort attribute for an id', () => {
      // WHEN
      const result = comp.sort();

      // THEN
      expect(result).toEqual(['id,desc']);
    });

    it('should calculate the sort attribute for a non-id attribute', () => {
      // GIVEN
      comp.propOrder = 'name';

      // WHEN
      const result = comp.sort();

      // THEN
      expect(result).toEqual(['name,desc', 'id']);
    });
    it('Should call delete service on confirmDelete', async () => {
      // GIVEN
      applyInviteCardServiceStub.delete.resolves({});

      // WHEN
      comp.prepareRemove({ id: 123 });
      comp.removeApplyInviteCard();
      await comp.$nextTick();

      // THEN
      expect(applyInviteCardServiceStub.delete.called).toBeTruthy();
      expect(applyInviteCardServiceStub.retrieve.callCount).toEqual(2);
    });
  });
});
