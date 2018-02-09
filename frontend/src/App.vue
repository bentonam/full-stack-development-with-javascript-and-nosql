<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div class="well">
            <form>
              <div class="form-group">
                <label for="firstname">First Name</label>
                <input type="text" v-model="input.person.firstname" class="form-control" id="firstname" placeholder="First Name">
              </div>
              <div class="form-group">
                <label for="lastname">Last Name</label>
                <input type="text" v-model="input.person.lastname" class="form-control" id="lastname" placeholder="Last Name">
              </div>
              <button type="button" v-on:click="createPerson()" class="btn btn-default">Save</button>
            </form>
          </div>
        </div>
        <div class="col-md-6">
          <div class="well">
            <form>
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" v-model="input.address.city" class="form-control" id="city" placeholder="City">
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input type="text" v-model="input.address.state" class="form-control" id="state" placeholder="State">
              </div>
              <button type="button" v-on:click="createAddress()" class="btn btn-default">Save</button>
            </form>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <ul class="list-group">
            <li v-for="(person, index) in people" class="list-group-item">
              {{ person.firstname }} {{ person.lastname }} -
              <span v-for="(address, index) in person.addresses">
                {{ address.city }}, {{ address.state }} /
              </span>
              <p>
                <form>
                  <div v-for="(address, index) in addresses">
                    <input type="radio" name="addressid" v-bind:value="address.id" v-model="input.addressid"> {{ address.city }}, {{ address.state }}
                  </div>
                  <button type="button" v-on:click="linkAddress(person.id)" class="btn btn-default">Save</button>
                </form>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'app',
  data() {
    return {
      input: {
        person: {
          first_name: '',
          last_name: '',
          email: '',
        },
        address: {
          city: '',
          state: '',
        },
        addressid: '',
      },
      people: [],
      addresses: [],
    };
  },
  mounted() {
    axios({ method: 'GET', url: '/api/people' }).then((result) => {
      this.people = result.data;
    });
    axios({ method: 'GET', url: '/api/addresses' }).then((result) => {
      this.addresses = result.data;
    });
  },
  methods: {
    createPerson() {
      if (this.input.person.firstname != '' && this.input.person.lastname != '') {
        axios({ method: 'POST', url: '/api/person', data: this.input.person, headers: { 'content-type': 'application/json' } }).then((result) => {
          this.people.push(result.data);
          this.input.person.firstname = '';
          this.input.person.lastname = '';
        });
      }
    },
    createAddress() {
      if (this.input.address.city != '' && this.input.address.state != '') {
        axios({ method: 'POST', url: '/api/address', data: this.input.address, headers: { 'content-type': 'application/json' } }).then((result) => {
          this.addresses.push(result.data);
          this.input.address.city = '';
          this.input.address.state = '';
        });
      }
    },
    linkAddress(personid) {
      if (this.input.addressid != undefined && personid != '') {
        axios({
          method: 'PUT',
          url: `/api/person/address/${personid}`,
          data: { addressid: this.input.addressid },
          headers: { 'content-type': 'application/json' } }).then((result) => {
          for (let i = 0; i < this.people.length; i++) {
            if (this.people[i].id == personid) {
              if (this.people[i].addresses == undefined) {
                this.people[i].addresses = [];
              }
              axios({ method: 'GET', url: `/api/address/${this.input.addressid}` }).then((result) => {
                this.people[i].addresses.push(result.data);
                this.input.addressid = '';
              });
            }
          }
        });
      }
    },
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
